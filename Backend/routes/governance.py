from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from config import db
from models.schemas import ProposalCreate, VoteCast, ProposalOut
from services.auth_service import get_current_user
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter(prefix="/governance", tags=["Governance"])


def _to_proposal_out(doc_id: str, d: dict) -> ProposalOut:
    return ProposalOut(
        id=doc_id,
        propertyId=d.get("property_id", ""),
        propertyTitle=d.get("property_title", ""),
        title=d.get("title", ""),
        description=d.get("description", ""),
        status=d.get("status", "active"),
        votesFor=d.get("votes_for", 0),
        votesAgainst=d.get("votes_against", 0),
        totalVotes=d.get("total_votes", 0),
        endDate=d.get("end_date", ""),
        createdDate=d.get("created_date", ""),
    )


@router.get("/proposals", response_model=List[ProposalOut])
async def list_proposals(user: dict = Depends(get_current_user)):
    docs = db.collection("proposals").stream()
    return [_to_proposal_out(doc.id, doc.to_dict()) for doc in docs]


@router.post("/proposals", response_model=ProposalOut)
async def create_proposal(body: ProposalCreate, user: dict = Depends(get_current_user)):
    prop_doc = db.collection("properties").document(body.property_id).get()
    if not prop_doc.exists:
        raise HTTPException(status_code=404, detail="Property not found")

    prop = prop_doc.to_dict()

    # Only token holders of this property can create proposals
    ownership = (
        db.collection("ownership")
        .where(filter=FieldFilter("user_id", "==", user["id"]))
        .where(filter=FieldFilter("property_id", "==", body.property_id))
        .get()
    )
    if not ownership:
        raise HTTPException(status_code=403, detail="You must own tokens to create a proposal")

    data = {
        "property_id": body.property_id,
        "property_title": prop["title"],
        "title": body.title,
        "description": body.description,
        "status": "active",
        "votes_for": 0,
        "votes_against": 0,
        "total_votes": prop.get("total_tokens", 0),
        "end_date": body.end_date,
        "created_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_by": user["id"],
        "voters": {},   # {user_id: "for"/"against"/"abstain"}
    }
    ref = db.collection("proposals").add(data)
    return _to_proposal_out(ref[1].id, data)


@router.post("/vote")
async def cast_vote(body: VoteCast, user: dict = Depends(get_current_user)):
    proposal_doc = db.collection("proposals").document(body.proposal_id).get()
    if not proposal_doc.exists:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal = proposal_doc.to_dict()

    if proposal["status"] != "active":
        raise HTTPException(status_code=400, detail="Proposal is not active")

    voters = proposal.get("voters", {})
    if user["id"] in voters:
        raise HTTPException(status_code=400, detail="You have already voted")

    # Voting power = number of tokens owned in that property
    ownership = (
        db.collection("ownership")
        .where(filter=FieldFilter("user_id", "==", user["id"]))
        .where(filter=FieldFilter("property_id", "==", proposal["property_id"]))
        .get()
    )
    if not ownership:
        raise HTTPException(status_code=403, detail="You must own tokens to vote")

    voting_power = ownership[0].to_dict().get("tokens_owned", 0)

    updates = {f"voters.{user['id']}": body.vote}
    if body.vote == "for":
        updates["votes_for"] = proposal["votes_for"] + voting_power
    elif body.vote == "against":
        updates["votes_against"] = proposal["votes_against"] + voting_power

    proposal_doc.reference.update(updates)

    return {
        "message": "Vote cast successfully",
        "vote": body.vote,
        "voting_power": voting_power,
    }

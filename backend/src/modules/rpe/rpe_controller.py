from fastapi import HTTPException, status
from uuid import UUID
from datetime import date
from typing import Optional

from src.modules.rpe.rpe_schema import (
    RPEEntryResponse,
    RPEEntryResponseModel,
    RPEEntryListResponseModel,
    RPEEntryCreate,
    RPEEntryUpdate,
    RPEStatsResponseModel,
    RPEHistoryResponseModel
)
from src.modules.rpe.rpe_service import RPEService
from src.modules.boxer.service import BoxerService
from src.modules.rpe.utils.logger import logger


class RPEController:

    @staticmethod
    async def create_entry(payload: RPEEntryCreate, current_user: dict) -> RPEEntryResponseModel:
        # Verify boxer exists and belongs to coach
        boxer = await BoxerService.get_boxer_by_id(payload.boxer_id)
        if not boxer:
            raise HTTPException(status_code=404, detail="Boxer not found")
        
        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        try:
            entry = await RPEService.create_entry(
                boxer_id=payload.boxer_id,
                session_rpe=payload.session_rpe,
                entry_date=payload.entry_date,
                fatigue=payload.fatigue,
                sleep_quality=payload.sleep_quality,
                soreness=payload.soreness,
                stress=payload.stress,
                notes=payload.notes,
                session_id=payload.session_id
            )

            return RPEEntryResponseModel(
                success=True,
                message="RPE entry created",
                data=RPEEntryResponse.model_validate(entry)
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_entry(entry_id: UUID, current_user: dict) -> RPEEntryResponseModel:
        entry = await RPEService.get_entry_by_id(entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Entry not found")

        # Verify ownership through boxer
        boxer = await BoxerService.get_boxer_by_id(entry.boxer_id)
        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        return RPEEntryResponseModel(
            success=True,
            message="RPE entry fetched",
            data=RPEEntryResponse.model_validate(entry)
        )

    @staticmethod
    async def get_boxer_entries(
        boxer_id: UUID,
        current_user: dict,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> RPEEntryListResponseModel:
        # Verify boxer belongs to coach
        boxer = await BoxerService.get_boxer_by_id(boxer_id)
        if not boxer:
            raise HTTPException(status_code=404, detail="Boxer not found")
        
        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        entries = await RPEService.get_entries_by_boxer(boxer_id, start_date, end_date)

        return RPEEntryListResponseModel(
            success=True,
            message=f"Found {len(entries)} entries",
            data=[RPEEntryResponse.model_validate(e) for e in entries]
        )

    @staticmethod
    async def get_all_entries(current_user: dict) -> RPEEntryListResponseModel:
        entries = await RPEService.get_entries_by_coach(UUID(current_user["id"]))
        
        return RPEEntryListResponseModel(
            success=True,
            message=f"Found {len(entries)} entries",
            data=[RPEEntryResponse.model_validate(e) for e in entries]
        )

    @staticmethod
    async def update_entry(
        entry_id: UUID,
        payload: RPEEntryUpdate,
        current_user: dict
    ) -> RPEEntryResponseModel:
        entry = await RPEService.get_entry_by_id(entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Entry not found")

        boxer = await BoxerService.get_boxer_by_id(entry.boxer_id)
        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        updated = await RPEService.update_entry(
            entry_id=entry_id,
            session_rpe=payload.session_rpe,
            fatigue=payload.fatigue,
            sleep_quality=payload.sleep_quality,
            soreness=payload.soreness,
            stress=payload.stress,
            notes=payload.notes,
            entry_date=payload.entry_date,
            session_id=payload.session_id
        )

        return RPEEntryResponseModel(
            success=True,
            message="RPE entry updated",
            data=RPEEntryResponse.model_validate(updated)
        )

    @staticmethod
    async def delete_entry(entry_id: UUID, current_user: dict) -> RPEEntryResponseModel:
        entry = await RPEService.get_entry_by_id(entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Entry not found")

        boxer = await BoxerService.get_boxer_by_id(entry.boxer_id)
        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        await RPEService.delete_entry(entry_id)

        return RPEEntryResponseModel(
            success=True,
            message="RPE entry deleted",
            data=None
        )

    @staticmethod
    async def get_boxer_stats(boxer_id: UUID, current_user: dict) -> RPEStatsResponseModel:
        boxer = await BoxerService.get_boxer_by_id(boxer_id)
        if not boxer:
            raise HTTPException(status_code=404, detail="Boxer not found")
        
        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        stats = await RPEService.get_boxer_stats(boxer_id)
        
        if not stats:
            raise HTTPException(status_code=404, detail="No RPE data available")

        from src.modules.rpe.rpe_schema import RPEStats
        
        return RPEStatsResponseModel(
            success=True,
            message="Stats calculated",
            data=RPEStats(
                boxer_id=boxer_id,
                boxer_name=f"{boxer.first_name} {boxer.last_name}",
                **stats
            )
        )

        
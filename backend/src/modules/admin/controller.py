from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from src.modules.admin.schema import AdminCreate, AdminResponse,AdminResponseModel
from src.modules.admin.service import AdminService
from src.modules.admin.utils.logger import logger


class AdminController:
    @staticmethod
    async def create_admin(admin_create: AdminCreate):
        existing = await AdminService.get_admin_by_email(admin_create.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        new_admin = await AdminService.create_admin(
            admin_create.email,
            admin_create.password
        )

        return AdminResponseModel(
            success=True,
            message="Admin created successfully",
            data=new_admin
        )    
    

    @staticmethod
    async def get_admin(admin_id: str):
        admin = await AdminService.get_admin_by_id(admin_id)
        if not admin:
            logger.warning(f"Admin not found: {admin_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"success": False, "message": "Admin not found", "data": None}
            )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"success": True, "message": "Admin fetched successfully", "data": AdminResponse.from_orm(admin).dict()}
        )

    @staticmethod
    async def get_all_admins():
        admins = await AdminService.get_all_admins()
        admin_list = [AdminResponse.from_orm(a).dict() for a in admins]
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"success": True, "message": "Admins fetched successfully", "data": admin_list}
        )

    @staticmethod
    async def update_admin(admin_id: str, email: str | None = None, password: str | None = None):
        updated_admin = await AdminService.update_admin(admin_id, email, password)
        if not updated_admin:
            logger.warning(f"Tried to update non-existing admin: {admin_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"success": False, "message": "Admin not found", "data": None}
            )
        logger.info(f"Admin updated: {admin_id}")
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"success": True, "message": "Admin updated successfully", "data": AdminResponse.from_orm(updated_admin).dict()}
        )

    @staticmethod
    async def delete_admin(admin_id: str):
        deleted = await AdminService.delete_admin(admin_id)
        if not deleted:
            logger.warning(f"Tried to delete non-existing admin: {admin_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"success": False, "message": "Admin not found", "data": None}
            )
        logger.info(f"Admin deleted: {admin_id}")
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"success": True, "message": "Admin deleted successfully", "data": None}
        )
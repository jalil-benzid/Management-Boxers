Admin Module API Documentation

Base URL for the module:

/api/admins

All responses are JSON with the following structure:

{
  "success": true | false,
  "message": "string",
  "data": {} | null | []
}
1. Create Admin

Endpoint:

POST /api/admins

Request Body:

{
  "email": "admin@example.com",
  "password": "yourpassword"
}

Response (Success 201):

{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "a3f9c1e2-5b4f-4d1a-8c2f-123456789abc",
    "email": "admin@example.com"
  }
}

Response (Failure - duplicate email):

{
  "success": false,
  "message": "Email already registered",
  "data": null
}

Response (Internal Error):

{
  "detail": "Internal server error"
}
2. Get All Admins

Endpoint:

GET /api/admins

Request Body: None

Response (Success):

{
  "success": true,
  "message": "Admins fetched successfully",
  "data": [
    {
      "id": "a3f9c1e2-5b4f-4d1a-8c2f-123456789abc",
      "email": "admin1@example.com"
    },
    {
      "id": "b1d7f5a8-4b2d-4c3a-9e1a-456789abcdef",
      "email": "admin2@example.com"
    }
  ]
}

Response (No admins found):

{
  "success": true,
  "message": "Admins fetched successfully",
  "data": []
}
3. Get Admin by ID

Endpoint:

GET /api/admins/{admin_id}

Path Parameter:

Name	Type	Description
admin_id	string	UUID of the admin to fetch

Response (Success):

{
  "success": true,
  "message": "Admin fetched successfully",
  "data": {
    "id": "a3f9c1e2-5b4f-4d1a-8c2f-123456789abc",
    "email": "admin@example.com"
  }
}

Response (Failure - not found):

{
  "success": false,
  "message": "Admin not found",
  "data": null
}
4. Update Admin

Endpoint:

PUT /api/admins/{admin_id}

Path Parameter:

Name	Type	Description
admin_id	string	UUID of the admin to update

Request Body (any fields optional):

{
  "email": "newadmin@example.com",
  "password": "newpassword"
}

Response (Success):

{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "id": "a3f9c1e2-5b4f-4d1a-8c2f-123456789abc",
    "email": "newadmin@example.com"
  }
}

Response (Failure - not found):

{
  "success": false,
  "message": "Admin not found",
  "data": null
}
5. Delete Admin

Endpoint:

DELETE /api/admins/{admin_id}

Path Parameter:

Name	Type	Description
admin_id	string	UUID of the admin to delete

Response (Success):

{
  "success": true,
  "message": "Admin deleted successfully",
  "data": null
}

Response (Failure - not found):

{
  "success": false,
  "message": "Admin not found",
  "data": null
}
Logging Behavior

All actions are logged using the module-specific logger:

Action	Log Level	File / Console Output
Admin created successfully	INFO	info.log / console
Admin updated successfully	INFO	info.log / console
Admin deleted successfully	INFO	info.log / console
Admin fetched (single/all)	INFO/DEBUG	info.log / console
Duplicate email	WARNING	info.log / console
Admin not found	WARNING	info.log / console
Unexpected errors	ERROR	errors.log / console
Notes

All IDs are UUIDs.

Passwords are hashed using bcrypt and never returned in responses.

Responses always follow the success / message / data format.

You can test all endpoints in Swagger UI (FastAPI automatically generates it).
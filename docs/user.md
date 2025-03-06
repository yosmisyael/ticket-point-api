# User API Specification

## Register User

Endpoint: POST /api/users

Request Body:

```json
{
  "email": "user@example.com",
  "name": "user",
  "password": "user1234"
}
```

Response Body (Success):

```json
{
  "data": {
    "name": "user"
  }
}
```

Response Body (Failed):

```json
{
  "error": "User is already taken."
}
```

## Login User

Endpoint: POST /api/users/login

Request Body:

```json
{
  "password": "user1234"
}
```

Response Body (Success):

```json
{
  "data": {
    "name": "user"
  }
}
```

Response Body (Failed):

```json
{
  "error": "Email or password is wrong."
}
```

## Logout User

Endpoint: DELETE /api/users/logout

Request Header:

- X-API-TOKEN: token

Response Body (Success):

```json
{
  "data": "OK"
}
```

Response Body (Failed):

```json
{
  "error": "Unauthorized."
}
```

## Get User

Endpoint: GET /api/users/current

Request Header:

- X-API-TOKEN: token

Response Body (Success):

```json
{
  "data": {
    "name": "example name"
  }
}
```

Response Body (Failed):

```json
{
  "error": "Unauthorized."
}
```

## Update User

Endpoint: PATCH /api/users/current

Request Header:

- X-API-TOKEN: token

Request Body:

```json
{
  "name": "user",
  "password": "user1234"
}
```

Response Body (Success):

```json
{
  "data": {
    "name": "user"
  }
}
```

Response Body (Failed):

```json
{
  "error": "Unauthorized."
}
```

## Email Confirmation

Endpoint: POST /api/users/validation

Request Body:

```json
{
  "validationCode": "123123"
}
```

Response Body (Success):

```json
{
  "data": {
    "message": "success"
  }
}
```

Response Body (Failed):

```json
{
  "error": "Unauthorized."
}
```


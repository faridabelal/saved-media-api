# Saved Media API

A REST API for managing saved movies, books, TV shows, and songs.
Built to gain hands-on experience with C#, ASP.NET Core, and
database persistence using Entity Framework Core.

## Technologies

- C# and .NET 10
- ASP.NET Core Minimal APIs
- Entity Framework Core
- SQLite

## Features

- Create, view, update, and delete saved media
- Validate required title and media type fields
- Store records in SQLite so changes survive application restarts
- Return HTTP status codes for successful requests, invalid input,
  and missing records

## Run locally

Requires the .NET 10 SDK.

From the project folder:

```bash
dotnet restore
dotnet run --urls http://localhost:5082
```

The application creates a local `media.db` database on first run.

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /media | List all items |
| GET | /media/{id} | Get one item |
| POST | /media | Create an item |
| PUT | /media/{id} | Update an item |
| DELETE | /media/{id} | Delete an item |

## Example request

```bash
curl -i -X POST http://localhost:5082/media \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","mediaType":"Movie"}'
```

## Verification

Manually tested CRUD operations using curl and a browser, including
checking that additions, updates, and deletions persist after restarting
the application.

## Scope

This is a local learning project. Authentication, user-specific
collections, and automated tests are not implemented.
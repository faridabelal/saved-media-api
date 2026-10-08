using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure SQLite and register our database context.
builder.Services.AddDbContext<MediaDbContext>(options =>
    options.UseSqlite("Data Source=media.db"));

var app = builder.Build();

// Create the database and its tables if they don't exist.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MediaDbContext>();
    db.Database.EnsureCreated();
}

app.MapGet("/", () => "Saved Media API is running!");

// Get all saved items.
app.MapGet("/media", async (MediaDbContext db) =>
    await db.MediaItems.ToListAsync());

// Get one item by ID.
app.MapGet("/media/{id:int}", async (int id, MediaDbContext db) =>
{
    var item = await db.MediaItems.FindAsync(id);

    if (item is null)
        return Results.NotFound();

    return Results.Ok(item);
});

// Add a new item.
app.MapPost("/media", async (MediaItem newItem, MediaDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(newItem.Title) ||
        string.IsNullOrWhiteSpace(newItem.MediaType))
    {
        return Results.BadRequest("Title and media type are required.");
    }

    var item = new MediaItem
    {
        Title = newItem.Title.Trim(),
        MediaType = newItem.MediaType.Trim()
    };

    db.MediaItems.Add(item);
    await db.SaveChangesAsync();

    return Results.Created($"/media/{item.Id}", item);
});

// Update an existing item.
app.MapPut("/media/{id:int}", async (
    int id, MediaItem updatedItem, MediaDbContext db) =>
{
    var item = await db.MediaItems.FindAsync(id);

    if (item is null)
        return Results.NotFound();

    if (string.IsNullOrWhiteSpace(updatedItem.Title) ||
        string.IsNullOrWhiteSpace(updatedItem.MediaType))
    {
        return Results.BadRequest("Title and media type are required.");
    }

    item.Title = updatedItem.Title.Trim();
    item.MediaType = updatedItem.MediaType.Trim();

    await db.SaveChangesAsync();

    return Results.Ok(item);
});

// Delete an item.
app.MapDelete("/media/{id:int}", async (int id, MediaDbContext db) =>
{
    var item = await db.MediaItems.FindAsync(id);

    if (item is null)
        return Results.NotFound();

    db.MediaItems.Remove(item);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
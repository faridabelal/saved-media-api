using Microsoft.EntityFrameworkCore;

public class MediaDbContext : DbContext
{
    public MediaDbContext(DbContextOptions<MediaDbContext> options)
        : base(options)
    {
    }

    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
}
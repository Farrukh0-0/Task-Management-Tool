using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Data;

public class ApplicationDbContext : IdentityDbContext<AppUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).HasMaxLength(250).IsRequired();
            entity.Property(t => t.Priority).HasMaxLength(20).HasDefaultValue("Medium").IsRequired();
            entity.Property(t => t.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(t => t.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(e => e.Owner)
                  .WithMany(u => u.Tasks)
                  .HasForeignKey(e => e.OwnerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Tasks)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(t => t.OwnerId).HasDatabaseName("IX_Tasks_OwnerId");
            entity.HasIndex(t => t.DueDate).HasDatabaseName("IX_Tasks_DueDate");
            entity.HasIndex(t => t.Priority).HasDatabaseName("IX_Tasks_Priority");
        });

        builder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).HasMaxLength(200).IsRequired();
        });

        builder.Entity<TaskComment>(entity =>
        {
            entity.ToTable("TaskComments");
            entity.HasKey(c => c.Id);

            entity.HasOne(c => c.Task)
                  .WithMany()
                  .HasForeignKey(c => c.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Author)
                  .WithMany()
                  .HasForeignKey(c => c.AuthorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

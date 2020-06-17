using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rates.SignalR;
using Rates.SignalR.BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Rates.SignalR.DAL
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, int>
    {
        private readonly DatabaseOptions _dbOptions;
        //public DbSet<CurGroup> CurGroups { get; set; }
        public DbSet<City> Citys { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, DatabaseOptions dbOptions) : base(options)
        {
            _dbOptions = dbOptions;
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(_dbOptions.ConnectionString);
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Rates.SignalR;
using Rates.SignalR.BLL;
using Rates.SignalR.Configuration.AutoMapper;
using Rates.SignalR.DAL;
using Rates.SignalR.Hubs;

namespace RT.SignalR
{
    public class Startup
    {


        // This method gets called by the runtime. Use this method to add services to the container.
        public IConfiguration Configuration { get; }
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        public void ConfigureServices(IServiceCollection services)
        {
            var dbOptions = new DatabaseOptions
            {
                ConnectionString = Configuration.GetConnectionString("DefaultConnection")
            };
            services.AddSingleton(dbOptions);
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(10);
                options.Cookie.HttpOnly = true;
            });
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(dbOptions.ConnectionString); // SQL SERVER
            });
            services.AddIdentity<User, Role>().AddRoles<Role>().AddRoleManager<RoleManager<Role>>().AddEntityFrameworkStores<ApplicationDbContext>().AddSignInManager<SignInManager<User>>().AddDefaultUI().AddDefaultTokenProviders();
            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = false;
            });
            services.AddAutoMapper(typeof(MainProfile));
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            services.AddSignalR(hubOptions =>
            {
                hubOptions.HandshakeTimeout = TimeSpan.FromSeconds(10);
            });
        }
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseAuthentication();
            app.UseSignalR(routes =>
            {
                routes.MapHub<CurrencyHub>("/currencyHub");
            });
            app.UseMvc(routes =>
            {
                routes.MapRoute(name: "default", template: "{controller=Cur}/{action=Index}/{id?}");
            });
        }
    }
}


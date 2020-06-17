using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Rates.SignalR;
using Rates.SignalR.BLL;
using Rates.SignalR.DAL;

namespace Rates.SignalR.Controllers
{
    [Authorize]
    public class CurController : Controller
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMapper _mapper;

        public CurController(ApplicationDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public IActionResult Index()
        {
            var users = _dbContext.Users.ToList();
            var citys = _dbContext.Citys;
            users.Insert(0, new User()
            {
                UserName = "All"
            });
            //var curGroups = _dbContext.CurGroups;
            var usersListItems = _mapper.Map<IEnumerable<SelectListItem>>(users);
            //var curGroupListItems = _mapper.Map<IEnumerable<SelectListItem>>(curGroups);
            var cityList = _mapper.Map<IEnumerable<SelectListItem>>(citys);
            return View(new Tuple<IEnumerable<SelectListItem>, IEnumerable<SelectListItem>>(usersListItems, cityList)); ;
        }
    }
}
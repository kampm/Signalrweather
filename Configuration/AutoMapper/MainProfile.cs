using AutoMapper;
using Microsoft.AspNetCore.Mvc.Rendering;
using Rates.SignalR;
using Rates.SignalR.BLL;
using Rates.SignalR.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Rates.SignalR.Configuration.AutoMapper
{
    public class MainProfile : Profile
    {
        public MainProfile()
        {
            //CreateMap<User, UserVm>()
            //    .ForMember(dst => dst.Groups,
            //    y => y.MapFrom(src => src.CurGroupToUsers.Select(cgu => cgu.CurGroup.Name)));
            //CreateMap<CurGroup, SelectListItem>()
            //    .ForMember(x => x.Text, y => y.MapFrom(z => z.Name))
            //    .ForMember(x => x.Value, y => y.MapFrom(z => z.Id));
            CreateMap<User, SelectListItem>()
                .ForMember(x => x.Text, y => y.MapFrom(z => z.UserName))
                .ForMember(x => x.Value, y => y.MapFrom(z => z.Id));
            CreateMap<City, SelectListItem>()
                .ForMember(x => x.Text, y => y.MapFrom(z => z.NameCity))
                .ForMember(x => x.Value, y => y.MapFrom(z => z.Id));

        }
    }
}

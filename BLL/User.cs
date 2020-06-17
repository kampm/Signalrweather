using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Rates.SignalR.BLL
{
    public class User : IdentityUser<int>
    {
        public static List<string> ConUser = new List<string>();
        //public ICollection<CurGroupToUsers> CurGroupToUsers { get; set; }
    }
}

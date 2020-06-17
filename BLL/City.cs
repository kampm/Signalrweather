﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Rates.SignalR.BLL
{
    public class City
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string NameCity { get; set; }
    }
}

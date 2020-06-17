using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Rates.SignalR.ViewModels
{
    public class MessageVm
    {
        [Required]
        public double CurrentTemp { get; set; }
        [Required]
        public double MinTemp { get; set; }
        [Required]
        public double MaxTemp { get; set; }
        [Required]
        public string Author { get; set; }
        [Required]
        public string RecipientName { get; set; }
        [Required]
        public string CurrentDataTime { get; set; }
        [Required]
        public string City { get; set; }
        public long Pressure { get; set; }
        public string Icon { get; set; }

    }
}

using AutoMapper;
using CurrencyLayer4NET;
using CurrencyLayer4NET.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Rates.SignalR.BLL;
using Rates.SignalR.DAL;
using Rates.SignalR.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Rates.SignalR.Hubs
{
    public class CurrencyHub : Hub
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMapper _mapper;
        public CurrencyHub(ApplicationDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext; _mapper = mapper;
        }
        public override Task OnConnectedAsync()
        {

            //User.ConUser.Add(Context.ConnectionId);
            return base.OnConnectedAsync();
        }
        //public override async Task OnDisconnectedAsync(Exception exception)
        //{
        //    User.ConUser.Remove(Context.ConnectionId);
        //    await base.OnDisconnectedAsync(exception);
        //}


        //https://api.openweathermap.org/data/2.5/weather?q=Warsaw,PL&units=metric&exclude=current,minutely&appid=34fb294269c1faca704e6d6440b12c3b
        //Darwmowe API pozwala na 60req/min
        //aktualizacja pogody jest co 10 minut

        [Authorize]
        public async Task SendMessageToUser(MessageVm message, CancellationToken cancellationToken)
        {

            message.Author = Context.User.Identity.Name;
            long tmp = 0;
            var requestAPI = $"https://api.openweathermap.org/data/2.5/weather?q={message.City},PL&units=metric&appid=34fb294269c1faca704e6d6440b12c3b";
            var xd = cancellationToken;
            while (true)
            {
                using (var httpClient = new HttpClient())
                {
                    try
                    {
                        while (true)
                        {
                            Task<HttpResponseMessage> getResponse = httpClient.GetAsync(requestAPI);
                            HttpResponseMessage response = await getResponse;
                            var responseJsonString = await response.Content.ReadAsStringAsync();
                            var weatherData = JsonConvert.DeserializeObject<Temperatures>(responseJsonString);

                            if (tmp != weatherData.Dt)
                            {
                                //Random random = new Random();
                                DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
                                message.CurrentDataTime = dtDateTime.AddSeconds(weatherData.Dt).ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss");
                                message.CurrentTemp = weatherData.Main.Temp;
                                message.MinTemp = weatherData.Main.TempMin;
                                message.MaxTemp = weatherData.Main.TempMax;
                                message.Pressure = weatherData.Main.Pressure;
                                message.Icon = weatherData.Weather.FirstOrDefault().Icon;
                                tmp = weatherData.Dt;
                                break;
                            }
                            await Task.Delay(TimeSpan.FromSeconds(5));
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
                var recipient = _dbContext.Users.FirstOrDefault(u => u.UserName == message.Author);
                if (recipient != null)
                {
                    await Clients.User(recipient.Id.ToString()).SendAsync("ReceiveMessage", message);
                }

            }

        }
    }
}

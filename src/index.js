
'use strict';

const inquirer = require('inquirer');
const axios = require("axios").default;
require('dotenv').config();

let countries = new Map();
countries.set("munich","germany");
countries.set("london","united kingdom");
countries.set("paris","france");

const questions = [
    {
        type: 'input',
        name: 'city',
        message: "Hello! This is ultimate.ai Virtual agent. Which city are you looking for today?\n",
        validate: value => {
            if(value=="exit")
            process.exit(0);

            const pass = value.toLowerCase().match(
                /^london$|^paris$|^munich$/
                );
            if (pass)
              return true;
      
            return 'Please enter a valid city\n';
          }
      },
      

]

const chat = () => {
    inquirer
  .prompt(questions)
  .then(answers => {

        const countryRequest = {
            method: 'GET',
            url: `https://disease.sh/v3/covid-19/countries/${countries.get(answers.city)}`,
            params: 
            {
                yesterday: true,
                twoDaysAgo: false,
                strict: false
            }

        };

        const cityRequest = {
            method: 'GET',
            url: 'https://www.triposo.com/api/20210317/location.json',
            params:
            {
                tag_labels: 'city',
                annotate: `trigram:${answers.city}`,
                count: 1,
                fields: 'snippet',
                order_by: '-trigram',
                account: process.env.CITY_ACCOUNT,
                token: process.env.CITY_TOKEN

            }
            };

        const weatherRequest = {
            method: 'GET',
            url: 'https://weatherapi-com.p.rapidapi.com/current.json',
            params: {q: answers.city},
            headers: {
              'x-rapidapi-key': process.env.WEATHER_KEY,
              'x-rapidapi-host': process.env.WEATHER_HOST
            }
          };

        Promise.all([axios.request(countryRequest),axios.request(weatherRequest),axios.request(cityRequest)])
        .then(response => {

            if (response[0].data.todayCases > 10000)
            console.log(`${answers.city}! Amazing choice!\n${response[2].data.results[0].snippet}\nThe weather currently is ${response[1].data.current.condition.text} and the tempreture feels like ${response[1].data.current.temp_c}C\nHowever, COVID-19 is widely spread in ${countries.get(answers.city)}! In the last 24 Hours, there are ${response[0].data.todayCases} new cases reported..`);
            else
            console.log(`${answers.city}! Amazing choice!\n${response[2].data.results[0].snippet}\nThe weather currently is ${response[1].data.current.condition.text} and the tempreture feels like ${response[1].data.current.temp_c}C\nCOVID-19 situation in ${countries.get(answers.city)} is significantly getting better! In the last 24 Hours, only ${response[0].data.todayCases} new cases were reported..`);

            chat();
        })
        .catch(error => {
            console.error(error);
        });
  })
  .catch(error => {
    console.error(error);
    });;
}

chat();


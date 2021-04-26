**Create a COVID-19 Agent to help decide your next destination**

_Using Node.js we will create a project that will use external APIs to generate travel data related to COVID_


## Prerequisites

You need the following tools to complete the steps in this tutorial:

* Download and install [Node.js and Node Package Manager (NPM)](https://nodejs.org/en/download/).
* Subscribe and get an API KEY for [WeatherAPI](https://rapidapi.com/weatherapi/api/weatherapi-com?endpoint=apiendpoint_bef542ef-a177-4633-aacc-ee9703945037)
* Subscribe and get an API KEY and Account ID for [Triposo API](https://www.triposo.com/api/)

## Steps

1. [Initialize a new Node.js project and git Repo](#Initialize-a-new-Node.js-project-and-git-Repo)
1. [Install needed dependencies](#Install-needed-dependencies)
1. [Create a .env file and store credentials](#Create-a-.env-file-and-store-credentials)
1. [Writing Code](#Writing-Code)
1. [Running our code](#Running-our-code)


### Step 1. Initialize a new Node.js project and git Repo
Execute the following commands in your terminal to start a new nodejs project.

```mkdir covid19agent
 cd covid19agent
 git init
 npx license mit > LICENSE
 npx gitignore node
 npm init -y
 git add -A
 git commit -m "Initial commit"
 ```



### Step 2. Install needed dependencies

1.  Run the following command to install Axios, the dependency we will be using to send HTTP requests.

  ```npm install axios```
  
2.  Run the following command to install Inquirer, the dependency we will be using to get input from the user from the terminal.

  ```npm install inquirer```
  
3.  Run the following command to install Dotenv, the dependency we will be using to store our credentials in a .env file.

  ```npm install dotenv```

### Step 3. Create a .env file and store credentials

Navigate to the home directory of your project and create a new file called ".env"
In this file add all the credentials and api keys generated from the prerequisite steps in the following format:
```
CITY_ACCOUNT=xxxx
CITY_TOKEN=xxxx
WEATHER_KEY=xxxxx
WEATHER_HOST=xxxx
```
__Note__: the variable names are names of your choice.

### Step 4. Writing Code

1.  Navigate to the home directory of your project and create a new directory called `"src"`
1.  Inside the src directory create a new file and name it `"index.js"`
1.  Open index.js using your favorite editor.
1.  In the first line, add ```'use strict';``` to enable strict mode.
1.  Then, we need to require our dependencies. 
    ```
    const inquirer = require('inquirer');
    const axios = require("axios").default;
    require('dotenv').config();
    ```
1.  Now we are going to create a new map and map cities to their corresponding countries:
    ```
    let countries = new Map();
    countries.set("munich","germany");
    countries.set("london","united kingdom");
    countries.set("paris","france");
    ```
1.  Next, we add our questions that will be asked by the bot using inquirer in an array.
    ```
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
     ```
1.  Now it is time to write our chat function
    ```
    const chat = () => {
    inquirer
    .prompt(questions)
    .then(answers => {
    ```
    the above lines create a function `chat()` which uses inquirer to pass the questions in the questions array to the user and save the answers.
    
1. We will be having 3 different API calls, one for getting the number of daily COVID-19 cases by country, the other is getting a snippet about the city, and the final api call to retrieve the weather condition in the specified city.
The below lines create 3 different objects for each api call. The object includes the request url, parameters, and headers needed to process the request. 
    ```
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
    ```
1.  Now its time to send these requests, here comes the power of axios since we will send the 3 requests in parallel.
    ```
    axios.all([axios.request(countryRequest),axios.request(weatherRequest),axios.request(cityRequest)])
        .then(axios.spread((countryResponse, weatherResponse, cityResponse) => {

            if (countryResponse.data.todayCases > 10000)
            console.log(`${answers.city}! Amazing choice!\n${cityResponse.data.results[0].snippet}\nThe weather currently is ${weatherResponse.data.current.condition.text} and the tempreture feels like ${weatherResponse.data.current.temp_c}C\nHowever, COVID-19 is widely spread in ${countries.get(answers.city)}! In the last 24 Hours, there are ${countryResponse.data.todayCases} new cases reported..`);
            else
            console.log(`${answers.city}! Amazing choice!\n${cityResponse.data.results[0].snippet}\nThe weather currently is ${weatherResponse.data.current.condition.text} and the tempreture feels like ${weatherResponse.data.current.temp_c}C\nCOVID-19 situation in ${countries.get(answers.city)} is significantly getting better! In the last 24 Hours, only ${countryResponse.data.todayCases} new cases were reported..`);

            chat();
        }))
        .catch(error => {
            console.error(error);
        });
        });
      }
    ```
    
    The above lines also check for the number of covid cases and sends a different message accordingly.
    
1.  Finally, we will call the chat method
    ```chat();```
    
    
### Step 5. Running our code.

Run the command ```node index.js``` in your terminal to start your application.

Below is the whole code:
```
  
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

        axios.all([axios.request(countryRequest),axios.request(weatherRequest),axios.request(cityRequest)])
        .then(axios.spread((countryResponse, weatherResponse, cityResponse) => {

            if (countryResponse.data.todayCases > 10000)
            console.log(`${answers.city}! Amazing choice!\n${cityResponse.data.results[0].snippet}\nThe weather currently is ${weatherResponse.data.current.condition.text} and the tempreture feels like ${weatherResponse.data.current.temp_c}C\nHowever, COVID-19 is widely spread in ${countries.get(answers.city)}! In the last 24 Hours, there are ${countryResponse.data.todayCases} new cases reported..`);
            else
            console.log(`${answers.city}! Amazing choice!\n${cityResponse.data.results[0].snippet}\nThe weather currently is ${weatherResponse.data.current.condition.text} and the tempreture feels like ${weatherResponse.data.current.temp_c}C\nCOVID-19 situation in ${countries.get(answers.city)} is significantly getting better! In the last 24 Hours, only ${countryResponse.data.todayCases} new cases were reported..`);

            chat();
        }))
        .catch(error => {
            console.error(error);
        });
  });
}

chat();


```

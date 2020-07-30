# Application
Gift App

## Built By
Kevin Jiang

## Links
live site: https://gift-app.now.sh/<br />
server: https://shielded-dusk-65015.herokuapp.com<br />

## Using The API
Currently the API supports GET, POST, DELETE, and PATCH endpoints.<br />

- Unprotected Endpoints<br />
  + Sign Up: POST (https://url/users/register)<br />

- Protected Endpoints<br />
  + Login: POST (https://url/users/login)<br />
  + Get Giftees: GET (https://url/users/giftees)<br />
  + Create a new Giftee: POST (https://url/giftees)<br />
  + Get one Giftee: GET (https://url/users/giftees/:giftee_id)<br />
  + Delete a Giftee: DELETE (https://url/giftees/:giftee_id)<br />
  + Get all Events associated with Giftee: GET (https://url/users/giftees/:giftee_id/events)<br />
  + Create a new Event: POST (https://url/events)<br />
  + Get one Event: GET (https://url/users/events/:event_id)<br />
  + Delete an Event: DELETE (https://url/event/:event_id)<br />
  + Get all Gifts associated with an Event: GET (https://url/users/events/:event_id/gifts)<br />
  + Create a new Gift: POST (https://url/gifts)<br />
  + Get one Gift: GET (https://url/users/gifts/:gift_id)<br />
  + Delete a Gift: DELETE (https://url/gifts/:gift_id)<br />
  + Update a Gift's notes: PATCH (https://url/gifts/:gift_id)<br />

## Screen Shots
![Landing](images/LandingPage.png)<br />
![LogIn](images/LoginPage.png)<br />
![Registration](images/RegistrationPage.png)<br />
![New Giftee Page](images/NewGifteePage.png)<br />
![New Event Page](images/NewEventPage.png)<br />
![Gifts Page](images/GiftsPage.png)<br />

### Summary
This app allows you to track significant dates for the people you care about.
Create Giftees, gift-worthy events for those Giftees, and track gift ideas to make those events memorable.

## Technologies
- Font End
  * React
- Back End
  * Node.js
  * Express
  * Postgresql
- Testing
  * Mocha, Chai
  * Jest
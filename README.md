
## [Song Quest](https://github.com/spongycode/song-quest) Backend details

### Routes `api/mobile`
- <b>`/gameplay`</b>
  - `/create`: Create a new game.
  - `/question`: Upload new questions and fetch questions category-wise.
  - `/check`: Check the correct answer for the question.
  - `/highscore`: Fetch the leaderboard category-wise.
  - `/history`: Fetch the user's game history.
  - `/save`: Save the game.
- <b>`/users`</b>
  - `/register`: Register new users.
  - `/login`: Login users.
  - `/profile`: Get and update profile details.
  - `/resetPassword`: Reset password and send OTP via email.


### Data Models

- <b> Game Model</b>

```json
{
  "game": {
    "player": "String (required)",
    "score": "Number (default: 0.0)",
    "accurate": "Number (default: 0)",
    "questionsId": "Array of ObjectId (ref: 'Question')",
    "category": "String (required)",
    "isGameSaved": "Boolean (default: false)",
    "createdAt": "Date (default: Current timestamp)",
    "expireAt": "Date (default: Current timestamp)"
  }
}
```
**Note:** This project utilizes a <b>[TTL (Time-to-Live) index](https://www.mongodb.com/docs/manual/core/index-ttl/)</b> to <b>automatically delete unsaved games</b> after `300 seconds`. The index is based on the `expireAt` field and is configured to delete games where `isGameSaved` is false. This ensures efficient cleanup of temporary data.
- <b>Question Model</b>

```json
{
  "question": {
    "title": "String (required)",
    "songUrl": "String",
    "options": [
      {
        "optionid": "Number (required)",
        "value": "String (required)"
      }
    ],
    "correctOptionId": "Number (required)",
    "category": "String (required)",
    "totalAttempts": "Number (default: 0)",
    "difficulty": "Number (default: 0.5)",
    "altText": "String (default: '')",
    "createdAt": "Date (default: Current timestamp)"
  }
}
```
- <b>User Model</b>
```json
{
  "user": {
    "username": "String (required, unique, trim)",
    "email": "String (required, unique, trim)",
    "imageUrl": "String",
    "password": "String (required, 'Password is required')",
    "gamesPlayed": "Number (default: 0)",
    "forgotPasswordToken": "String",
    "forgotPasswordTokenExpiry": "Date",
    "refreshToken": "String",
    "createdAt": "Date (default: Current timestamp)"
  }
}
```

### Scoring
The score for each question is determined using the formula below.

<div align="center">  
  
```math
score = max(0, -0.00057 \times timeTaken^3 + 0.037 \times timeTaken^2 - 0.96 \times timeTaken + 10)
```

<img src="https://github.com/spongycode/song-quest/assets/65273165/182fd4cb-f3ea-4a4f-a3f8-f14f93097664" alt="drawing" width="400"/>
</div>


## Getting Started 🚀
To begin using Song Quest, clone the repository from [here](https://github.com/spongycode/song-quest) and open the project in Android Studio. Clone the backend server from [here](https://github.com/spongycode/song-quest-backend) and fill up the required environment variables mentioned in the `sample.env` file to set up your own server.


## Contributing 🤝
Feel free to contribute to this project by submitting issues, pull requests, or providing valuable feedback. Your contributions are always welcome! 🙌

## License 📄
Song Quest is released under the [MIT License](https://opensource.org/licenses/MIT). Feel free to modify or add to this list based on the specific features of your app.

## Happy coding! 🎉👩‍💻👨‍💻

// Create a global JavaScript object for password checking
window.passwordchecker = {
    validatePassword: function (password) {
        // Basic password checks
        var outputString = ""
        var isStrong = true;
        var difficulty = 0;
        if (password.length < 8) {
            outputString += "Pass is to short , must contain at least 8 letters"
            isStrong = false
            difficulty +=2;
        }
        if (!/[A-Z]/.test(password)) {

            outputString += "Password must contain at least one uppercase letter.";
            isStrong = false
            difficulty +=2;
        }
        if (!/[a-z]/.test(password)) {
            outputString += "Password must contain at least one lowercase letter.";
            isStrong = false
            difficulty += 2;
        }
        if (!/[0-9]/.test(password)) {
            outputString += "Password must contain at least one number.";
            isStrong = false
            difficulty += 2;
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            outputString += "Password must contain at least one special character (e.g., !, @, #, $).";
            isStrong = false
            difficulty += 2;
        }
        // Check for sequential characters (e.g., "1234", "abcd")
        if (/(0123456789|abcdefghijklmnopqrstuvwxyz|ABCDEFGHIJKLMNOPQRSTUVWXYZ)/.test(password)) {
            outputString += "Password contains a sequential pattern (e.g., '1234' or 'abcd'). This weakens the password. ";
            isStrong = false;
            difficulty += 3;
        }
        if (isStrong)
            outputString = "Your pass is Strong"

        return { outputString: outputString, difficulty: difficulty };

    }
    ,
    getRandomPass: function () {
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        var passwordLength = 8; // Set your desired password length here
        var randomPassword = "";
        for (var i = 0; i < passwordLength; i++) {
            var randomIndex = Math.floor(Math.random() * characters.length);
            randomPassword += characters[randomIndex];
        }
        return randomPassword;
    }
};

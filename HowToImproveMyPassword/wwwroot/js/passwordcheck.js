window.passwordcheck = {
    validatePassword: function (password) {
        // Checks password strength based on 6 criterias
        let outputString = "";
        let isStrong = true;
        let difficulty = 0;

        if (password.length != 0) { // if password is not empty we continue

            if (password.length < 8) { // length checking 
                outputString += "Password is too short, must contain at least 8 characters.\n";
                isStrong = false;
                difficulty += 2;
            }

            if (!/[A-Z]/.test(password)) { // If there is Uppercase
                outputString += "Password must contain at least one uppercase letter.\n";
                isStrong = false;
                difficulty += 2;
            }

            if (!/[a-z]/.test(password)) { //lowercase
                outputString += "Password must contain at least one lowercase letter.\n";
                isStrong = false;
                difficulty += 2;
            }

            if (!/[0-9]/.test(password)) {//number
                outputString += "Password must contain at least one number.\n";
                isStrong = false;
                difficulty += 2;
            }

            if (!/[^A-Za-z0-9]/.test(password)) {// sepcial character
                outputString += "Password must contain at least one special character (e.g., !, @, #, $).\n";
                isStrong = false;
                difficulty += 2;
            }

            const hasSequentialPattern = (password) => {
                const sequences = [
                    "0123456789",
                    "abcdefghijklmnopqrstuvwxyz",// ENG Alphabbetic Lowercase
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",// ENG Alphabbetic Uppercase
                    "QWERTYUIOPASDFGHJKLZXCVBNM",// QWERTY
                    "qwertyuiopasdfghjklzxcvbnm",// QWERTY
                    "AZERTYUIOPQSDFGHJKLMWXCVBN",// AZERTY uppercase
                    "azertyuiopqsdfghjklmwxcvbn" // AZERTY lowercase
                ];

                for (const seq of sequences) {
                    for (let i = 0; i < seq.length - 2; i++) {
                        const pattern = seq.substring(i, i + 3);
                        if (password.includes(pattern)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            if (hasSequentialPattern(password)) {
                outputString += "Password contains a sequential pattern (e.g., '1234' or 'abcd'). This weakens the password.\n";
                isStrong = false;
                difficulty += 2;
            }

            if (isStrong) {
                outputString = "Your password is strong.";
            }
        }
        else {
            outputString = "Please input password"
        }
        return {
            outputString: outputString.trim(),
            difficulty: difficulty
        };
    },
    getRandomPass: function () {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        const passwordLength = 12; // Set your desired password length here
        let randomPassword = "";

        for (let i = 0; i < passwordLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomPassword += characters[randomIndex];
        }

        return randomPassword;
    },
    estimateCrackTime: function (password) {
        try {
            if (typeof password !== "string" || password.length === 0) {
                return { output: 0 }; // Return 0 for invalid or empty input
            }

            const guessesPerSecond = 1e11; // 100 billion guesses per second
            const characterSetSize = 94; // Character set size (ASCII printable characters)
            const passwordLength = password.length;

            const totalCombinations = Math.pow(characterSetSize, passwordLength);
            const crackTimeInSeconds = totalCombinations / guessesPerSecond;

            if (crackTimeInSeconds > Number.MAX_SAFE_INTEGER) {
                return { output: 999999999999 }; // Cap for extremely long times
            } else {
                return { output: Math.round(crackTimeInSeconds) }; // Return integer
            }
        } catch (e) {
            console.error("Error in estimateCrackTime:", e);
            return { output: 0 }; // Default fallback for errors
        }
    },
    isPasswordLeaked: async function (password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest("SHA-1", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();

            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const hashData = await response.text();

            const hashLines = hashData.split("\n");
            for (const line of hashLines) {
                const [hashSuffix, count] = line.split(":");
                if (hashSuffix === suffix) {
                    return { leaked: true, count: parseInt(count, 10) };
                }
            }

            return { leaked: false };
        } catch (error) {
            console.error("Error checking password leak:", error);
            return { leaked: false, error: true };
        }
    },
    smartSuggestion: function (password) {
        if (!password || typeof password !== "string") {
            return "";
        }

        const replacements = {
            I: ["!", "1"],
            i: ["!", "1"],
            A: ["4", "@"],
            a: ["4", "@"],
            O: ["0", "Q"],
            o: ["0"],
            E: ["3"],
            e: ["3"],
            S: ["$", "5"],
            s: ["$", "5"],
            B: ["8"],
            b: ["8"],
            G: ["6"],
            g: ["9"]
        };

        return password
            .replace(/\s+/g, "") // Remove all spaces
            .split("")
            .map(char => {
                if (replacements[char]) {
                    const options = replacements[char];
                    return options[Math.floor(Math.random() * options.length)];
                }
                return char;
            })
            .join("");
    },
    rememberingDifficulty: function (password) {

        if (!password || typeof password !== "string") {
            return "";
        }

        let outputString = "easy to remember";
        var difficulty = 0;
        var diversity = 0;

        difficulty += password.length/2;
       
        const lowercaseCount = (password.match(/[a-z]/g) || []).length;
        const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
        const numberCount = (password.match(/[0-9]/g) || []).length;
        const specialCharCount = (password.match(/[^A-Za-z0-9]/g) || []).length;

        // Add to diversity if there are any occurrences
        if (lowercaseCount > 0) diversity++;
        if (uppercaseCount > 0) diversity++;
        if (numberCount > 0) diversity++;
        if (specialCharCount > 0) diversity++;

        // Add difficulty based on counts
        difficulty += Math.min(uppercaseCount, 5); // Limit large counts for balance
        difficulty += Math.min(numberCount, 5);
        difficulty += Math.min(specialCharCount, 5);

        // Adjust output based on diversity and difficulty
        if (diversity >= 3 || difficulty > 6) {
            outputString = "hard to remember";
        } else if (diversity === 2) {
            outputString = "moderately easy to remember";
        }

        return outputString;
    }
};

window.passwordchecker3 = {
    validatePassword: function (password) {
        // Basic password checks
        let outputString = "";
        let isStrong = true;
        let difficulty = 0;

        if (password.length < 8) {
            outputString += "Password is too short, must contain at least 8 characters.\n";
            isStrong = false;
            difficulty += 2;
        }

        if (!/[A-Z]/.test(password)) {
            outputString += "Password must contain at least one uppercase letter.\n";
            isStrong = false;
            difficulty += 2;
        }

        if (!/[a-z]/.test(password)) {
            outputString += "Password must contain at least one lowercase letter.\n";
            isStrong = false;
            difficulty += 2;
        }

        if (!/[0-9]/.test(password)) {
            outputString += "Password must contain at least one number.\n";
            isStrong = false;
            difficulty += 2;
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            outputString += "Password must contain at least one special character (e.g., !, @, #, $).\n";
            isStrong = false;
            difficulty += 2;
        }

        // Check for sequential patterns (e.g., "1234", "abcd")
        if (/0123456789|abcdefghijklmnopqrstuvwxyz|ABCDEFGHIJKLMNOPQRSTUVWXYZ/.test(password)) {
            outputString += "Password contains a sequential pattern (e.g., '1234' or 'abcd'). This weakens the password.\n";
            isStrong = false;
            difficulty += 3;
        }

        if (isStrong) {
            outputString = "Your password is strong.";
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
    }
};

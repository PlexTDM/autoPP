/**
 * @name AutoPP
 * @author Unnamed
 * @description Automatically changes you status with up-to-date PP
 * @version 0.7.27
 * @authorId 576978523135279107
 */

class AutoPP {
    load() {
        // Status.authToken = BdApi.findModule(m => m.default && m.default.getToken).default.getToken();
        this.authToken = BdApi.getData("osu", "token") || '';
        if (!this.authToken) {
            BdApi.showToast("no auth token provided", { type: "error" })
            stop()
        }

        this.lowestInterval = 10000;
        this.intervalTime = BdApi.getData("osu", "time") || this.lowestInterval;

        this.username = BdApi.getData("osu", "name");
        if (!this.username) {
            BdApi.showToast("please provide your osu! username or id", { type: "error" })
            stop()
        }

        Status.url = 'https://discord.com/api/v9/users/@me/settings';
        Status.osuUrl = 'https://osu-pp-middleware.herokuapp.com';
        Status.headers = {
            'Authorization': this.authToken,
            'Content-Type': 'application/json',
        };
        // another one bcs im dumb
        Status.username = this.username;
        this.hasError = false;
    }

    start() {
        this.interval = setInterval(this.tick, this.intervalTime);
    }

    stop() {
        clearInterval(this.interval);
    }

    tick() {
        // var mins = new Date().getMinutes();
        Status.Check(Status.username);

        // if u want to run it once every hour
        // if (mins == "00") {
        // Status.Check('PlexTDM');
        // }
    }
    getSettingsPanel() {

        let settings = document.createElement("div");
        settings.style.padding = "10px";

        // Discord Auth Token
        settings.appendChild(GUI.newLabel("Discord Auth Token"));
        let authToken = settings.appendChild(GUI.newInput(this.authToken, 'Discord Auth Token'));
        authToken.style.marginBottom = "15px";


        // Username
        settings.appendChild(GUI.newLabel("Osu Username"));
        let username = settings.appendChild(GUI.newInput(this.username, 'Username or ID'));
        username.style.marginBottom = "15px";

        // intervel 
        settings.appendChild(GUI.newLabel("Interval between each check (ms)"));
        let timeout = settings.appendChild(GUI.newNumericInput(this.intervalTime, `cannot be lower than ${this.lowestInterval}`));
        timeout.style.marginBottom = "15px";

        // Save button div
        let actions = settings.appendChild(GUI.newHBox());

        // Save
        let save = actions.appendChild(GUI.newButton("Save"));
        save.onclick = () => {
            if (this.hasError) return BdApi.showToast("Settings were NOT saved!", { type: "error" });
            try {
                // save data
                BdApi.setData("osu", "name", username.value);
                BdApi.setData("osu", "time", parseInt(timeout.value));
                BdApi.setData("osu", "token", authToken.value)
            } catch (e) {
                BdApi.showToast(e, { type: "error" });
                return;
            }
            BdApi.showToast("Settings were saved!", { type: "success" });

            // Restart
            this.stop();
            this.load();
            this.start();
        };
        return settings;
    }
}



/* Set Status */
const Status = {
    Check: async(id) => {
        try {
            const resp = await fetch(`${Status.osuUrl}/?id=${id}`);
            const data = await resp.json();
            const pp = `PP: ${data.pp}`;
            const oldpp = document.querySelector('.customStatus-1UAQAK').innerText;
            oldpp != pp ? Status.Set(pp, oldpp) : console.log('not changed');
        } catch (error) {
            console.log(error);
        }
    },
    Set: async(pp, old = pp) => {
        const req = await fetch(Status.url, {
            method: "PATCH",
            headers: Status.headers,
            body: JSON.stringify({ custom_status: { text: pp } })
        }).then(async res => await res.json());
        console.log('changed status from ' + old + ' to ' + pp);
    }
};

const GUI = {
    newInput: (text = "", placeholder = "") => {
        let input = document.createElement("input");
        input.className = "textArea-2CLwUE textAreaSlate-9-y-k2 slateContainer-3x9zil";
        input.style.padding = '5px';
        input.style.fontSize = '15px';
        input.style.border = '2px solid whitesmoke';
        input.style.background = '#202225';
        input.value = text;
        input.placeholder = placeholder;

        input.onblur = () => {
            if (!input.value) {
                this.hasError = true;
                BdApi.showToast("Please fill in you Username", { type: "error" });
            } else {
                this.hasError = false;
            }
        }

        return input;
    },
    newNumericInput: (num = 0, placeholder = "") => {
        let out = GUI.newInput(num, placeholder);
        out.setAttribute("type", "number");
        out.onblur = () => {
            if (out.value < this.lowestInterval) {
                this.hasError = true;
                BdApi.showToast(`Value must not be higher than ${this.lowestInterval}ms`, { type: "error" });
            } else {
                this.hasError = false;
            }
        }
        return out;
    },
    newLabel: (text = "") => {
        let label = document.createElement("h5");
        label.style.marginBottom = "10px";
        label.style.color = 'whitesmoke';
        label.innerText = String(text);
        return label;
    },

    newButton: (text) => {
        let button = document.createElement("button");
        button.className = "	";
        button.innerText = text;
        return button;
    },

    newHBox: () => {
        let hbox = document.createElement("div");
        hbox.style.display = "flex";
        hbox.style.flexDirection = "row";
        return hbox;
    },
};

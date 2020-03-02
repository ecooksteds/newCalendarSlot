const PollingChit = require("./pollingChit");

class pollingSlot{
    constructor(slotTuple)
    {
        this.slotList = slotTuple;
        this.date = slotTuple[2];
        this.timeStart = slotTuple[3];
        this.timeEnd = slotTuple[4];
        this.userID = slotTuple[5];

    }

    parseTimeString (unParsedString)
    {
        var timeString = unParsedString[0] + unParsedString[1] + unParsedString[3] + unParsedString[4];
        var timeInt = int(timeString);
        var AMPMString = unParsedString[6] + unParsedString[7];
        if(AMPMString == "PM")
        {
            timeInt += 1200;
        }    

        return timeInt
    }

    convertToChitList()
    {
        var chitList = [];
        var leftBoundInt = this.parseTimeString(timeStart);
        var rightBoundInt = this.parseTimeString(timeEnd);
        var curr = leftBoundInt;
        var next = leftBoundInt + 15;
        while( next <= rightBoundInt){
            var tempChit = new PollingChit(this.date, curr, next, this.userID);
            chitList.push(tempChit);
            curr += 15;
            next += 15;
            if((next - 60) % 100 == 0)
            {
                next += 40;
            }
            if((curr - 60) % 100 == 0)
            {
                curr += 40;
            }

        return chitList;
        }

    
    }
    get getUserID(){
        return this.userID;
    }

    get getTimeStart(){
        return this.timeStart;
    }

    get getTimeEnd(){
        return this.timeEnd;
    }

    get getDateD(){
        return this.date;
    }
}

module.exports = pollingSlot;
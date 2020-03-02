class pollingChit{
    constructor(date, timeStart, timeEnd, userID)
    {
        this.date = date;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.userID = userID;  
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

module.exports = pollingChit;
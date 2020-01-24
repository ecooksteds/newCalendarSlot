class Slot(object):

    def __init__(self, slotTuple):
        self.slotTuple = slotTuple
        self.day = slotTuple[0]
        self.date = slotTuple[1]
        self.timeStart = slotTuple[2]
        self.timeEnd = slotTuple[3]
        self.userID = slotTuple[4]


    def getDay(self):
        return self.day

    def getDate(self):
        return self.date

    def getTimeStart(self):
        return self.timeStart

    def getTimeEnd(self):
        return self.timeEnd

    def getUserID(self):
        return self.userID

    def __str__(self):  # toString method
        return "{} {} {} {}".format(self.day, self.date, self.timeStart, self.timeEnd)
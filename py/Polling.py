from Slot import Slot
import pymysql.cursors

class Polling():

    def __init__(self, meetingID):
        self.meeting = meetingID
        self.usersList = self.populateUsersList()
        self.user1List = []
        self.user2List = []
        db = pymysql.connect(host = "us-cdbr-iron-east-05.cleardb.net", user = "b15bfd522a38aa", password = "d436c805", database = "heroku_66bd76f57e3f221")
        cursor = db.cursor()

        firstUser = self.usersList[0]

        cursor.execute("SELECT * FROM slot WHERE userID = %s", [firstUser])
        user1RawList = cursor.fetchall()
        for r in user1RawList:
            tempSlot = Slot(r)
            self.user1List.append(tempSlot)

        db.commit()
        cursor.close()
        db.close()

        db = pymysql.connect(host="localhost", user="evan", password="evan", database="SlotDatabase")
        cursor2 = db.cursor()

        secondUser = self.usersList[1]

        cursor2.execute("SELECT * FROM slot WHERE userID = %s", [secondUser])
        user2RawList = cursor2.fetchall()
        for i in user2RawList:
            tempSlot2 = Slot(i)
            self.user2List.append(tempSlot2)


        db.commit()
        cursor2.close()
        db.close()

        # except:
        #     db.rollback()
        #     print("failure")



    def getOpenSlot(self):
        for i in self.user1List:
            checkDay = i.getDay()
            checkDate = i.getDate()
            checkTimeStart = i.getTimeStart()
            for j in self.user2List:
                if(j.getDay()== checkDay):
                    if(j.getDate()==checkDate):
                        if(j.getTimeStart() == checkTimeStart):
                            return "Best Slot Offer: " + str(i)
        return "No Compatible Slot"


    def populateUsersList(self):
        db = pymysql.connect(host="localhost", user="evan", password="evan", database="SlotDatabase")
        cursor = db.cursor()

        cursor.execute("SELECT invitees FROM meeting WHERE meetingID = %s", [self.meeting])
        usersTuple = cursor.fetchone()
        userString = usersTuple[0]
        usersList = userString.split(',')

        db.commit()
        cursor.close()
        db.close()

        return usersList



import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();


const app = express();

app.use(express.json());
app.use(cors());
//calendly post  route request handler..
app.post('/calendly-webhook', async (req, res) => {
  const { event, payload } = req.body;
  try {
    if (event === "invitee.created") {
    const { invitee, event: eventData, questions_and_answers} = payload;
//extracted detail and storing in booking Details..
    const bookingDetails = {
      "inviteeName": invitee?.name,
      "inviteeEmail": invitee?.email,
      "googleMeetLink": eventData?.location.location,
      "eventStartTime": eventData?.start_time,
      "eventEndTime": eventData?.end_time,
      "timezone": eventData?.event_timezone,
      "eventType": eventData?.name,
      "eventUUID": eventData?.uuid,
      "inviteeUUID": invitee?.uuid,
      "rescheduleURL": invitee?.reschedule_url,
      "cancelURL": invitee?.cancel_url,
      "createdAt": invitee?.created_at,
      "customQnA": questions_and_answers ?? []
    };

    console.log("📅 New Calendly Booking:");
    console.log(bookingDetails);
    //Sending meeting details to Discord..
    await DiscordConnect(JSON.stringify(bookingDetails,null,2));

    return res.status(200).json({message : 'Webhook received',
                        bookingDetails                    
                    });
  }
    
  } catch (error) {
    console.log('something went wrong...,',error);
  } 
});
const PORT = 8086
app.listen(PORT,()=>{
  console.log('Discord is Listening to send Meet details to FlashFire team..!!')
})





//ddiscord webhook post route handler..
export const DiscordConnect = async (message) => {
const webhookURL = process.env.DISCORD_WEB_HOOK_URL;
  try {
    const response = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `🚨 App Update: ${message}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send: ${response.statusText}`);
    }

    console.log('✅ Message sent to Discord!');
  } catch (error) {
    console.error('❌ Error sending message:', error);
  }
};




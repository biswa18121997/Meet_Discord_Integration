import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();


const app = express();

app.use(express.json());
app.use(cors());
//calendly post  route request handler..
app.post('/calendly-webhook', async (req, res) => {
  //schema for displaying time in readable format
  const options = {
    timeZone: 'Asia/Kolkata', 
    year: 'numeric',
    month: 'short',  
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
};
  const { event, payload } = req.body;
  console.log("req.body-->",req.body);
  console.log('meet link', req.body.payload?.scheduled_event?.location)
  try {
    if (event === "invitee.created") {
    const { invitee, event: eventData, questions_and_answers} = payload;
//extracted detail and storing in booking Details..
    const bookingDetails = {
      "Invitee Name": payload?.name,
      "Invitee Email": payload?.email,
      "GoogleMeet Link": payload?.scheduled_event?.location?.join_url,
      "EventStart Time": payload?.scheduled_event?.start_time.toLocaleString('en-IN', options),
      "Booked At": req.body?.created_at.toLocaleString('en-IN',options)
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




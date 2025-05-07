import MessageClient from "@azure-rest/communication-messages";

export const sendVerificationCodeWhatsApp = async (
  mobileNumber: string,
  verifyCode: string
): Promise<boolean> => {
  const connectionString = process.env.AZURE_WHATSAPP_CONNECTION_STRING as string;
  const client = MessageClient(connectionString);
  const ChannelId = process.env.AZURE_WHATSAPP_CHANNEL_ID as string;

  try {
    const formattedNumber = mobileNumber.includes("+")
      ? mobileNumber
      : `+91${mobileNumber}`;

    // Body parameter ({{1}})
    const bodyTemplateValue = {
      kind: "text",
      name: "otp",
      text: verifyCode,
    };

    // Button parameter ({{2}})
    const buttonTemplateValue = {
      kind: "quickAction",
      name: "button",
      text: verifyCode,
    };

    // Define template bindings
    const templateBindings = {
      kind: "whatsApp",
      body: [
        {
          refValue: "otp", // Bind {{1}} in the body
        },
      ],
      buttons: [
        {
          subType: "url",
          refValue: "button", // Bind {{2}} in the button URL
        },
      ],
    };

    const template = {
      name: "verifyacc",
      language: "en",
      bindings: templateBindings,
      values: [bodyTemplateValue, buttonTemplateValue], // Two values
    };

    const messageResult = await client.path("/messages/notifications:send").post({
      contentType: "application/json",
      body: {
        channelRegistrationId: ChannelId,
        to: [formattedNumber],
        kind: "template",
        template: template,
      },
    });

    if (messageResult.status !== "202") {
      console.error("Failed to send WhatsApp verification code:", messageResult.body);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending WhatsApp verification code:", error);
    return false;
  }
};
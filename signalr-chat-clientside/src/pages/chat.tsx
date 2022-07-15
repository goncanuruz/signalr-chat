import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import PerfertScrollBar from "react-perfect-scrollbar";
import "./chat.scss";
import { chatData } from "./defaultData";
const icon = require("./sendicon.png");
const ChatPage = () => {
  const [activepage, setActivepage] = useState<
    "click-username-screen" | "chat-screen"
  >("click-username-screen");
  const [username, setUsername] = useState<string>();
  const [messages, setMessages] = useState(chatData);
  const connectionRef = useRef<HubConnection | null>(null);
  const AlwaysScrollToBottom = () => {
    const elementRef = useRef(null);
    useEffect(() =>
      //@ts-ignore
      elementRef.current.scrollIntoView()
    );
    return <div ref={elementRef} />;
  };
  const connectSignalR = (user: string) => {
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7238/chatHub")
      .configureLogging(LogLevel.Debug)
      .build();
    console.log(`Trying to connect signal r`);
    connection
      .start()
      .then(() => {
        console.log(`CONNECTED`);
      })
      .catch((err: any) => {
        console.log(`ERROR: ${err.toString()}`);
      });
    connection.onclose(async () => {
      console.log(`Disconnected!!`);
      connectionRef.current = null;
    });
    connection.on("ReceiveMessage", (username, message) => {
      setMessages((state) => [
        ...state,
        {
          username: username,
          message: message,
          avatar: "https://avatars.githubusercontent.com/u/9625224",
        },
      ]);
    });
    connectionRef.current = connection;
  };
  const sendMessageFunc = async (values: any) => {
    if (connectionRef.current) {
      try {
        const result = await connectionRef.current.invoke(
          "SendMessage",
          values.username,
          values.message
        );
        console.log(result, "RESULT");
      } catch (err: any) {
        console.log(`Error sending message`);
      }
    }
  };

  return (
    <div>
      {activepage === "chat-screen" && (
        <div className="chat-screen">
          <div className="width-1080 chat-main">
            <div className="chat-message-list-main">
              <PerfertScrollBar style={{ height: "100%" }}>
                <div className="chat-message-list">
                  {messages.map((message, i) => (
                    <div key={i} className="chat-message-element">
                      <img
                        className="avatar"
                        alt=""
                        width={45}
                        height={45}
                        src={message.avatar}
                      />
                      <span className={"chat-message-bubble"}>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: 11,
                            color: "rgb(47 32 149 / 52%)",
                            textAlign: "left",
                            margin: "0px 0px 4px 0px",
                          }}
                        >
                          {message.username}
                        </p>
                        {message.message}
                      </span>
                    </div>
                  ))}
                </div>
                <AlwaysScrollToBottom />
              </PerfertScrollBar>
            </div>
            <div className="chat-message-send">
              <Formik
                initialValues={{ message: "", username: username }}
                validate={(values) => {
                  const errors = {};
                  if (!values.message) {
                    //@ts-ignore
                    errors.message = "";
                  }
                  return errors;
                }}
                onSubmit={(values, { resetForm }) => {
                  sendMessageFunc(values);
                  resetForm();
                }}
              >
                {({ values, handleChange, handleBlur, handleSubmit }) => (
                  <>
                    <form onSubmit={handleSubmit}>
                      <input
                        type="message"
                        name="message"
                        placeholder="Message..."
                        className="chat-send-message-input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.message}
                      />

                      <button
                        type="submit"
                        className="chat-send-message-button"
                      >
                        <img src={icon} alt="" width={20} />
                      </button>
                    </form>
                  </>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
      {activepage === "click-username-screen" && (
        <Formik
          initialValues={{ username: "" }}
          validate={(values) => {
            const errors = {};
            if (!values.username) {
              //@ts-ignore
              errors.username = "Click Username !";
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            setUsername(values.username);
            setTimeout(() => {
              setActivepage("chat-screen");
              setSubmitting(false);
              connectSignalR(values.username);
            }, 400);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <form onSubmit={handleSubmit}>
              <div className="no-username-screen">
                <input
                  type="username"
                  name="username"
                  placeholder="Click Username"
                  className="username-input"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                />
                <span className="form-error-text">
                  {errors.username && touched.username && errors.username}
                </span>
                <button
                  type="submit"
                  className="form-button"
                  disabled={isSubmitting}
                >
                  Join Chat
                </button>
              </div>
            </form>
          )}
        </Formik>
      )}
    </div>
  );
};
export default ChatPage;

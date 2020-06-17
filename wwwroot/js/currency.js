"use strict";
var connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:44381/currencyHub").build();
connection.start().catch(function (err) {
    return console.error(err.toString());
});

function encodeText(text) {
    if (text !== undefined && text !== null) {
        text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const encodedHtml = $("<div />").text(text).html();
        return encodedHtml;
    }
    return "";
}

$("#sendmessage").click(function (event) {
    event.preventDefault();
    if ($("#message").val() === undefined || $("#message").val() === "") {
        alert("Type a message");
        return;
    }
    const message = {
        Content: $("#message").val(),
        RecipientName: $("#choose").val() === "User" ?
            $("#user  option:selected").text() : $("#curGroup  option:selected").text()
    };

    if ($("#choose").val() === "User") {
        if (message.RecipientName === "All")
            connection.invoke("SendMessageAll", message);
        else
            connection.invoke("SendMessageToUser", message);
    } else {
        //connection.invoke("SendMessageToGroup", message);
        connection.invoke("SendCurrencyToGroup", message);
    }
    $("#message").val("").focus();
});

connection.on("ReceiveMessage", function (message) {
    const li = $("<li>");
    li.html(encodeText(message.author) + " : " + encodeText(message.content));
    $("#discussion").append(li);
}); 
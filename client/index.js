/*
  Original Author: Patrick Catanzariti
  Original Source Code: https://github.com/sitepoint-editors/Api-AI-Personal-Assistant-Demo
  Original Tutorial: https://www.sitepoint.com/how-to-build-your-own-ai-assistant-using-api-ai/

  Edited by Juan Carlos Gallegos to use with Dialogflow's V2 API.
*/

// Generated with: $ gcloud auth application-default print-access-token
var accessTokenV2 = "ya29.c.ElrMBrXmGfcMdEbR8Xv3lA_vwI7Iqzt4u3GlMzae_ziUYOTpOQjfLOIOELf-LoQrrvNcA24stb7MYrGo2HJNjj40OfM7RqpGs70FJopzzFLUozDvyczQaoRLtKM",
  baseUrlV2 = "https://dialogflow.googleapis.com/v2/projects/muze-2b5fa/",
  sessionKey = 12345, // generated by caller
  $speechInput,
  $recBtn,
  recognition,
  messageRecording = "Recording...",
  messageCouldntHear = "I couldn't hear you, could you say that again?",
  messageInternalError = "Oh no, there has been an internal server error",
  messageSorry = "I'm sorry, I don't have the answer to that yet.";

$(document).ready(function() {
  $speechInput = $("#speech");
  $recBtn = $("#rec");

  $speechInput.keypress(function(event) {
	if (event.which == 13) {
	  event.preventDefault();
	  send();
	}
  });
  $recBtn.on("click", function(event) {
	switchRecognition();
  });
  $(".debug__btn").on("click", function() {
	$(this).next().toggleClass("is-active");
	return false;
  });
});

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
	  recognition.interimResults = false;

  recognition.onstart = function(event) {
	respond(messageRecording);
	updateRec();
  };
  recognition.onresult = function(event) {
	recognition.onend = null;

	var text = "";
	  for (var i = event.resultIndex; i < event.results.length; ++i) {
		text += event.results[i][0].transcript;
	  }
	  setInput(text);
	stopRecognition();
  };
  recognition.onend = function() {
	respond(messageCouldntHear);
	stopRecognition();
  };
  recognition.lang = "en-US";
  recognition.start();
}

function stopRecognition() {
  if (recognition) {
	recognition.stop();
	recognition = null;
  }
  updateRec();
}

function switchRecognition() {
  if (recognition) {
	stopRecognition();
  } else {
	startRecognition();
  }
}

function setInput(text) {
  $speechInput.val(text);
  send();
}

function updateRec() {
  $recBtn.text(recognition ? "Stop" : "Speak");
}

// see https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent.sessions/detectIntent#TextInput
function send() {
  var body = {
    queryInput: {
      text: {
        text: $speechInput.val(),
        languageCode: "en"
      }
    }
  }
  var resourcePath = `agent/sessions/${sessionKey}:detectIntent`
  $.ajax({
    type: "POST",
    url: baseUrlV2 + resourcePath,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
      "Authorization": "Bearer " + accessTokenV2
    },
    data: JSON.stringify(body),

    success: function(data) {
      prepareResponse(data);
    },
    error: function() {
      respond(messageInternalError);
    }
  });
}

function prepareResponse(val) {
  var debugJSON = JSON.stringify(val, undefined, 2);
	var spokenResponse = val.queryResult.fulfillmentMessages[0].text.text[0];

  respond(spokenResponse);
  debugRespond(debugJSON);
}

function debugRespond(val) {
  $("#response").text(val);
}

function respond(val) {
  if (val == "") {
	val = messageSorry;
  }

  if (val !== messageRecording) {
	var msg = new SpeechSynthesisUtterance();
	msg.voiceURI = "native";
	msg.text = val;
	msg.lang = "en-US";
	window.speechSynthesis.speak(msg);
  }

  $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(val);
}

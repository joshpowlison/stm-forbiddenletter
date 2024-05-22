const moduleFunctions = {
	"onVoiceSayWord": onVoiceSayWord,
	"changeVoiceMessageOnFail": changeVoiceMessageOnFail,
};

module.LoadModule(moduleFunctions);

// TODO: save in settings
let settings = {
	onFailPhrase: 'You said the Forbidden Letter \"[0]\"! You must die!'
};

var forbiddenLetterOptions = [
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
];

const DELAY_BETWEEN_CHANGES = 1000 * 60 * 5; // 5 minutes
const COOLDOWN_BETWEEN_LISTENS = 1000 * 2; // 2 seconds

const EL_NEXT_TIME_CHANGE = document.getElementById('next-time-change');
const EL_FAIL_COUNT = document.getElementById('fail-count');
const EL_FORBIDDEN_LETTER = document.getElementById('forbidden-letter');

var nextChangeTime = 0;
var nextStartTime = 0;
var forbiddenLetterRegex;
var failCount = 0;

var voiceSettings = {
	'rate': 1,
	'pitch': 0,
	'voice': 'David'
};

async function updateForbiddenLetter()
{
	forbiddenLetter = Utility.getRandomItem(forbiddenLetterOptions);

	EL_FORBIDDEN_LETTER.textContent = forbiddenLetter.toUpperCase();

	nextChangeTime = Date.now() + DELAY_BETWEEN_CHANGES;
	forbiddenLetterRegex = new RegExp(forbiddenLetter, 'i');

	// TODO: use custom events in the Core setup for these instead.
	// That would make this WAY more flexible.
	ttsSetup('The forbidden letter is now \"' + forbiddenLetter + '\"! Do not say it or you must die!');
	module.F('Console.Log', 'The Forbidden Letter is now "' + forbiddenLetter + '".');

	nextStartTime = Date.now() + COOLDOWN_BETWEEN_LISTENS;
}

async function onFail(word)
{
	let phrase = settings.onFailPhrase.replace('[0]', forbiddenLetter);
	ttsSetup(phrase);

	// TODO: use custom events in the Core setup for these instead.
	// That would make this WAY more flexible.
	module.F('Video.Play', 'explosion');
	module.F('Console.Log', 'Streamer said "' + word + '" which had the Forbidden Letter "' + forbiddenLetter + '".');

	failCount ++;
	EL_FAIL_COUNT.textContent = failCount;
	
	updateForbiddenLetter();
}

async function changeVoiceMessageOnFail(name, event)
{
	settings.onFailPhrase = event;
}

async function onVoiceSayWord(name, event)
{
	// Ignore if we haven't started yet
	if(Date.now() < nextStartTime)
		return;

	var isMatch = forbiddenLetterRegex.test(event);
	if(isMatch)
	{
		await onFail(event);
	}
}

function ttsSetup(text)
{
	var settings = structuredClone(voiceSettings);
	settings.text = text;
	
	module.F('TTS.Say', settings);
}

async function onAnimationFrame()
{
	var timeUntilChange = nextChangeTime - Date.now();
	var timeUntilChangeDisplay = Math.ceil(timeUntilChange / 1000);
	EL_NEXT_TIME_CHANGE.textContent = timeUntilChangeDisplay;
	
	if(timeUntilChange < 0)
	{
		updateForbiddenLetter();
	}
	
	window.requestAnimationFrame(onAnimationFrame);
}

updateForbiddenLetter();
window.requestAnimationFrame(onAnimationFrame);

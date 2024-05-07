const moduleFunctions = {
	"onVoiceSayWord": onVoiceSayWord
};

Module.LoadModule(moduleFunctions);

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
	Module.F('Console.Log', 'The Forbidden Letter is now "' + forbiddenLetter + '".');

	nextStartTime = Date.now() + COOLDOWN_BETWEEN_LISTENS;
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

async function onFail(word)
{
	// TODO: use custom events in the Core setup for these instead.
	// That would make this WAY more flexible.
	ttsSetup('You said the Forbidden Letter \"' + forbiddenLetter + '\"! You must die!');
	Module.F('Video.Play', 'explosion');
	Module.F('Console.Log', 'Streamer said "' + word + '" which had the Forbidden Letter "' + forbiddenLetter + '".');

	failCount ++;
	EL_FAIL_COUNT.textContent = failCount;
	
	updateForbiddenLetter();
}

function ttsSetup(text)
{
	var settings = structuredClone(voiceSettings);
	settings.text = text;
	
	Module.F('TTS.Say', settings);
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

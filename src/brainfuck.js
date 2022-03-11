
var running = false;

async function do_interpret()
{
    if (running)
        return;

    running = true;

    const code = document.getElementById("input").value;
    const output = document.getElementById('output');
    const userInput = document.getElementById('userInput').value;
    await interpret(code, userInput, output);

    running = false;
}

function modulo(x, y)
{
    return x - y * Math.floor(x / y);
}

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function interpret(buffer, userInput, output)
{
    output.value = "";

    var outputBuffer = "";

    var memorySize = 1024;
    var lineCount = 1;
    var charCount = 1;

    var stack = [];
    var pairs = {};

    for (var i = 0; i < buffer.length; i++)
    {
        var c = buffer.charAt(i);

        if (c == '\n')
        {
            lineCount++;
            charCount = 1;
        }
        else if (c == '[')
        {
            stack.push(i);
        }
        else if (c == ']')
        {
            if (stack.length == 0)
            {
                output.value = 'brainfuck: error: Unmatched ] at line ' + lineCount + ', char ' + charCount;
                return;
            }

            var top = stack.pop();

            pairs[top] = i;
            pairs[i] = top;
        }

        charCount++;
    }

    if (stack.length != 0)
    {
        output.value = 'brainfuck: error: Unmatched [ at line ' + lineCount + ', char ' + charCount;
        return;
    }

    var tape = [];

    for (var i = 0; i < memorySize; i++)
    {
        tape.push(0);
    }

    var j = 0;

    for (var i = 0; i < buffer.length; i++)
    {
        var c = buffer.charAt(i);

        if (c == '>')
        {
            j = modulo(j + 1, memorySize);
        }
        else if (c == '<')
        {
            j = modulo(j - 1, memorySize);
        }
        else if (c == '+')
        {
            tape[j] = modulo(tape[j] + 1, 256);
        }
        else if (c == '-')
        {
            tape[j] = modulo(tape[j] - 1, 256);
        }
        else if (c == '.')
        {
            outputBuffer += String.fromCharCode(tape[j]);

            if (outputBuffer.length > 100)
            {
                output.value += outputBuffer.replace(/\r/g, '');
                outputBuffer = "";
                await sleep(0);
            }
        }
        else if (c == ',')
        {
            if (userInput.length == 0)
            {
                tape[j] = 0;
                continue;
            }

            tape[j] = userInput.charCodeAt(0);
            userInput = userInput.substring(1);
        }
        else if (c == '[')
        {
            if (tape[j] == 0)
            {
                i = pairs[i];
            }
        }
        else if (c == ']')
        {
            if (tape[j] != 0)
            {
                i = pairs[i];
            }
        }
    }

    output.value += outputBuffer.replace(/\r/g, '');
}

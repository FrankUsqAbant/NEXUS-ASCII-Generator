/*
FIGlet.js (a FIGment engine)
Copyright (c) 2010, Scott Gonzalez
Personal use is granted, commercial use requires licensing.
<https://github.com/scottgonzalez/figlet-js>
*/

// This file has been modified from its original UMD format to be a standard ES module.
// It includes robustness fixes for parsing and hardblank handling.

const factory = () => {
	let figlet: any = {};

	figlet.fonts = {};
	figlet.options = {
		font: "Standard",
		horizontalLayout: "default",
		verticalLayout: "default",
		width: 80,
		whitespaceBreak: false,
	};

	figlet.parseFont = function (name: string, fn: string) {
		if (name in this.fonts) {
			return;
		}

        try {
            const headerEnd = fn.indexOf("\n");
            if (headerEnd === -1) return; // Invalid font data

            // FLF spec: "The first 5 characters of the file are always "flf2a". The 6th character is the "hardblank"."
            // We capture it to replace it later.
            const hardblank = fn.charAt(5);

            let settings = fn.substring(0, headerEnd).split(" "),
                height = parseInt(settings[1], 10),
                maxLength = parseInt(settings[3], 10),
                oldLayout = parseInt(settings[4], 10),
                commentLines = parseInt(settings[5], 10);

            if (isNaN(height) || height <= 0) return; // Invalid height

            let fontData = fn.substring(headerEnd + 1),
                lines = fontData.split("\n");
            
            // Remove comments
            if (lines.length < commentLines) return;
            let comments = lines.splice(0, commentLines).join("\n");

            let chars: any = {},
                end_char = "@"; // Default

            // determine the end character from the end of lines if possible
            // Scanning a few lines to find the terminator char
            for(let i=0; i < Math.min(lines.length, 20); i++) {
                const line = lines[i];
                if (line.length > 0) {
                    const lastChar = line.charAt(line.length - 1);
                    if (lastChar === '@' || lastChar === '#' || lastChar === '$') {
                        end_char = lastChar;
                        break;
                    }
                }
            }

            // Helper to extract and trim lines for a character
            function get_char_lines(start: number) {
                let char_lines = lines.slice(start, start + height);
                // Replace end_char with empty string
                for (let i = 0; i < char_lines.length; i++) {
                    // Robust trimming of end char
                    let line = char_lines[i];
                    
                    // Try to find double end char first (end of char definition)
                    // But FLF usually ends line with one end_char, and the char def ends with line having two.
                    // We just want to strip the end characters.
                    
                    let index = line.lastIndexOf(end_char);
                    if (index !== -1) {
                        // If the line ends with double char, strip both.
                        // If it ends with single, strip one.
                        if (index > 0 && line.charAt(index - 1) === end_char) {
                            char_lines[i] = line.substring(0, index - 1);
                        } else {
                            char_lines[i] = line.substring(0, index);
                        }
                    }
                }
                return char_lines;
            }

            let i = 0;
            // normal characters 32-126
            for (let char_i = 32; char_i <= 126; char_i++) {
                if (i + height > lines.length) break;
                chars[char_i] = get_char_lines(i);
                i += height;
            }

            // German characters (standard in many FLF fonts)
            const german_chars = [196, 214, 220, 228, 246, 252, 223];
            if (i + (german_chars.length * height) <= lines.length) {
                for (let j = 0; j < german_chars.length; j++) {
                    chars[german_chars[j]] = get_char_lines(i);
                    i += height;
                }
            }

            this.fonts[name] = {
                height: height,
                maxLength: maxLength,
                oldLayout: oldLayout,
                comments: comments,
                chars: chars,
                hardblank: hardblank,
            };
        } catch (e) {
            console.error("Failed to parse font " + name, e);
        }
	};

	figlet.text = function (txt: string, options: any, fn: any) {
		if (typeof options === "function") {
			fn = options;
			options = null;
		}

		options = options || {};
		for (let key in this.options) {
			if (options[key] === undefined) {
				options[key] = this.options[key];
			}
		}

		if (!this.fonts[options.font]) {
            if (fn) fn(new Error("Font not loaded"), null);
			return;
		}

		let font = this.fonts[options.font],
			output = [],
			char_width,
			output_width = 0;
		
        for (let i = 0; i < font.height; i++) {
			output[i] = "";
		}

		// Simple layout (smushing implementation removed for stability/size, using default kerning behavior approximation)
        // Restoring simplified appender
		for (let i = 0, len = txt.length; i < len; i++) {
			let char_code = txt.charCodeAt(i),
				char_data = font.chars[char_code];
			
            if (!char_data) {
                // Try space? or skip
                continue;
			}

			for (let j = 0; j < font.height; j++) {
                if (char_data[j]) {
				    output[j] += char_data[j];
                }
			}
		}

		let result = output.join("\n");

        // Replace hardblanks with spaces
        if (font.hardblank) {
             const hb = font.hardblank.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             result = result.replace(new RegExp(hb, 'g'), ' ');
        }

		if (fn) {
			fn(null, result);
		} else {
			return result;
		}
	};

	return figlet;
};

const figlet = factory();
export default figlet;
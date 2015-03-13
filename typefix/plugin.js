/**
 *
 * TypeFix for CKEditor – pre-alpha
 * Fixes typography as you type
 *
 */

CKEDITOR.plugins.add("typefix", {
	init: function(editor){		
		editor.on("change", function(event){
			
			// Single character look-ahead/-behind
			var prevChar = getChars(editor, "previous"),
				thisChar = getChars(editor, "this"),
				nextChar = getChars(editor, "next");
				
			//debug
			console.log("Previous char: " + prevChar);
			console.log("Typed char: " + thisChar);
			console.log("Next char: " + nextChar);
			
			// Do the replacements
			switch(thisChar){
				
				// Replace false double quotes
				case '"':
					// Start of string or at the beginning of a new word
					if(prevChar == undefined || prevChar.match(/\s/g)){
						replaceCharsWith("“", editor);
					}
					// End of string or a word
					else if(nextChar == undefined || nextChar.match(/\s/g)){
						replaceCharsWith("”", editor);
					}
					break;
				
				// Replace false single quotes
				case "'":
					// Start of string or at the beginning of a new word
					if(prevChar == undefined || prevChar.match(/\s/g)){
						replaceCharsWith("‘", editor);
					}
					// End of string or a word
					else if(nextChar == undefined || nextChar.match(/\s/g)){
						replaceCharsWith("’", editor);
					}
					break;
				
				// Replace false number ranges and other dash crimes
				case "-":
					// Number ranges
					if(prevChar.match(/\d/g) || prevChar.match(/\d/g) && nextChar.match(/\d/g)){
						replaceCharsWith("–", editor);
					}
					// Double hyphens
					if(prevChar.match(/-/g)){
						replaceCharsWith("–", editor, 2);
					}
					break;
			}
			
			// TODO
			// Double character look-ahead/-behind
			/*
			var prevChars = getChars(editor, "previous", 2),
				thisChars = getChars(editor, "this"),
				nextChars = getChars(editor, "next", 2);
			
			//debug
				console.log("Previous chars: " + prevChars);
				console.log("Typed chars: " + thisChars);
				console.log("Next chars: " + nextChars);
			*/
		});
	}
});



function replaceCharsWith(character, editor, charNum) {
	// Assign current caret position and get range/node
    var curPos = editor.getSelection().createBookmarks(true),
    	range = editor.getSelection().getRanges()[ 0 ],
        startNode = range.startContainer;
	
	// Determine how many characters to replace
	var charsToReplace = (charNum) ? charNum : 1;
	regex = new RegExp(".{" + charsToReplace + "}$");
		
	// Get current range/node text and replace last character
	nodeText = startNode.getText();
    nodeText = nodeText.replace(regex, character);
    startNode.setText(nodeText);
        
    // Set caret to saved position
    range.moveToBookmark(curPos[0]);
    range.select();
}


function getChars(editor, charPosition, charNum){
	// Check wether all necessary parameters are provided
	if(editor && charPosition){
		// TODO:
		// Determine how many characters to get
		var charsToGet = (charNum) ? charNum : 1;
				
		// Assign caret offset depending on which characters to get
		switch(charPosition){
			case "previous":
				var caretOffset = charsToGet + 1;
				break;
			case "this":
				var caretOffset = 1;
				break;
			case "next":
				var caretOffset = charsToGet - 1;
				break;
		}
		
		// Get current range
		var range = editor.getSelection().getRanges()[0],
	        startNode = range.startContainer;
		
		// Range does NOT at the beginning of the node
	    if(startNode.type == CKEDITOR.NODE_TEXT && range.startOffset){
		    return startNode.getText()[range.startOffset - caretOffset];
	    }
	    
	    // Range starts at the beginning of the node	        
	    else {
	        // Expand the range to the beginning of editable
	        range.collapse(true);
	        range.setStartAt(editor.editable(), CKEDITOR.POSITION_AFTER_START);
	        // Walk through the dom to find the previous text node
	        var walker = new CKEDITOR.dom.walker(range),
	            node;
	        while((node = walker.previous())){
	            // If found, return the desired character of the text node
	            if(node.type == CKEDITOR.NODE_TEXT){
	                return node.getText().slice(- caretOffset);
	            }
	        }
	    }
	    
	    // If selection starts at the beginning of the editor
	    return null;	
		
	} else {
		console.log("Not all parameters provided!");
		return null;
	}
}
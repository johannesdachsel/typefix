/**
 *
 * TypeFix for CKEditor
 * Fixes typography as you type
 *
 */

CKEDITOR.plugins.add( 'typefix', {
	init: function(editor) {		
		editor.on('change', function(event){
			//debug
			console.log("Previous char: " + getChar(editor, "previous"));
			console.log("Typed char: " + getChar(editor, "this"));
			console.log("Next char: " + getChar(editor, "next"));
			
			var prevChar = getChar(editor, "previous"),
				thisChar = getChar(editor, "this"),
				nextChar = getChar(editor, "next");
			
			// Do the replacements
			switch(thisChar){
				// Replace false double quotes
				case '"':
					// Start of string or at the beginning of a new word
					if(prevChar == undefined || prevChar == " "){
						replaceCharWith("“", editor);
					}
					// End of string or a word
					else if(nextChar == undefined || nextChar == " "){
						replaceCharWith("”", editor);
					}
					break;
			}
		});
	}
});



function replaceCharWith(character, editor) {
		// Assign current caret position and get range/node
    var curPos = editor.getSelection().createBookmarks(true),
    	range = editor.getSelection().getRanges()[ 0 ],
        startNode = range.startContainer,
		
		// Get current range/node text and replace last character
		nodeText = startNode.getText();
        nodeText = nodeText.replace(/.$/, character);
        startNode.setText(nodeText);
        
        // Set caret to saved position
        range.moveToBookmark(curPos[0]);
        range.select();
}


function getChar(editor, charPosition){
	// Check wether all parameters are provided
	if(editor && charPosition){
		// Assign caret offset depending on which character to get
		switch(charPosition){
			case "previous":
				var caretOffset = 2;
				break;
			case "this":
				var caretOffset = 1;
				break;
			case "next":
				var caretOffset = 0;
				break;
		}
		
		// Get current range
		var range = editor.getSelection().getRanges()[ 0 ],
	        startNode = range.startContainer;
		
		// Range does NOT at the beginning of the node
	    if(startNode.type == CKEDITOR.NODE_TEXT && range.startOffset){
		    return startNode.getText()[range.startOffset - caretOffset];
	    }
	    
	    // Range starts at the beginning of the node	        
	    else {
	        // Expand the range to the beginning of editable
	        range.collapse( true );
	        range.setStartAt(editor.editable(), CKEDITOR.POSITION_AFTER_START);
	        // Walk through the dom to find the previous text node
	        var walker = new CKEDITOR.dom.walker( range ),
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

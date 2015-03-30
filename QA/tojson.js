var questions = [];
$(document).ready(function() {

	$(".test-question").each(function() {
		var question = {
			"question": $(this).find(".test-question-text").text(),
			"question_response": {},
			"answer": $(this).find(".test-answer-actual strong").text(),
			"explanation": $(this).find(".test-answer-justification").text(),
			"options": {}
		}
		$(this).find(".test-response-options").each(function() {
			question['question_response'][$(this).find(".test-response-numeral")] = $(this).find(".test-response-option");
		});
		$(this).find(".test-response-passive > div").each(function() {
			question['options'][$(this).find(".test-response-letter").text()] = $(this).find(".test-response-answer").text();
		});
		questions.push(question);
	});

});
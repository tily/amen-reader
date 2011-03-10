
var TextSplitter = function(options) {
	if(options) {
		this.punctuation = options.punctuation
		this.brace = options.brace
	}
	this.segmenter = new TinySegmenter()
}
TextSplitter.prototype = {
	split: function(text) {
		var list = []
		var sentences = this.splitToSentences(text)
		for(var i = 0; i < sentences.length; i++) {
			var item = {str:sentences[i]}
			item.arr = this.segmenter.segment(item.str)
			item.pos = this.getPhrasePositions(item.arr)
			list.push(item)
		}
		return list
	},
	splitToSentences: function(text) {
		var sentences = []
		var buf = []
		for(var i = 0; i < text.length; i++) {
			var c = text.charAt(i)
			buf.push(c)
			if(c.match(/^(。|」)$/)) {
				var sentence = buf.join('')
				if(!this.brace) { sentence = sentence.replace(/(「|」)/, "") }
				if(!this.punctuation) { sentence = sentence.replace(/。/, "") }
				sentences.push(sentence)
				buf = []
			}
		}
		return sentences
	},
	getPhrasePositions: function(segments) {
	    var pos = []
	    var start = 0
	    var reg = /^(にゃ|ばかし|てん|より|すら|からには|ノ|のう|じゃあ|ばかり|之|ども|しも|っと|なんて|っけ|程|で|から|にて|ので|に|で|し|なんか|け|ねー|かも|なり|ねん|ヨ|ねッ|や|に|ネ|わい|だに|けど|くらい|かな|どころか|で|さ|でも|へ|だって|なあ|のに|よ|ヲ|ぞ|とも|ヘ|だって|じゃ|ぞ|だの|もん|だり|やら|とか|さかい|なり| つつ|なぁ|な|ヨー|ねェ|ワ|と|ほど|やら|やいなや|と|けむ|なー|ねエ|ね|だけ|たって|よう|べ|ん|ばっかり|ずつ|じゃ|ねぇ|なァ|か|の|んで|なぁー|ば|なり|と| なんぞ|て|ん|わ|しか|や|けれど|ものの|ちゃ|じゃァ|や|を|よー|かしら|から|が|ねえ|のみ|さえ|たり|なぞ|デ|かぁ|および|は|やら|ばっか|ぜ|っきゃ|ナ|や|けども|ながら|の|こそ|と|まで|に|など|とも|の|が|かい|ど|ちゃあ|も|ん|けれども|ぐらい|と|迄)$/
	    for(var i = 0; i < segments.length; i++) {
	        if(
			// TODO
	            (segments[i].match(reg) && segments[i+1] && !segments[i+1].match(reg)) ||
	            i == segments.length-1
	        ) {
	            pos.push([start, i+1])
	            start = i+1
	        }
	    }
	    return pos
	}
}

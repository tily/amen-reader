var Player = function(output, option) {
	this.output = output
	this.page = []
	this.json = null
	this.offset = 0
	this.paused = true
	this.textLoaded = false
	this.wavLoaded = false
    	if(option) {
		for(var i in option) { this[i] = option[i] }
	}
}
Player.prototype = {
	load : function(source) {
		var that = this
		$.ajax({
			url : '/json/' + source.text,
			dataType: 'json',
			success: function(json) {
				that.json = json
				var splitter = new TextSplitter({punctuation:true, brace:false})
				var sentences = splitter.split(json.text)
				for(var i = 0; i < sentences.length; i++) {
					var pos = sentences[i].pos
					var arr = sentences[i].arr
					for(var j = 0; j < pos.length; j++) {
						var text = arr.slice(pos[j][0], pos[j][1]).join("")
						that.page.push(text)
					}
				}
				that.textLoaded = true
				if(that.textLoaded && that.wavLoaded) { that.onload(that.json) }
			}
		})
		this.wav = new WavFile(source.audio, function(wav) {
			wav.beatDetect()
			that.wavLoaded = true
			if(that.textLoaded && that.wavLoaded) { that.onload(that.json) }
		})
	},
	play : function() {
		this.paused = false
		this.repeat()
	},
	repeat : function() {
		if(this.paused) return
		var that = this
		if(!this.page[this.offset]) {
			this.pause()
			this.onended()
			return
		}
		if(this.next) {
		    	window.audio = this.next
			this.current = this.next
			this.current.play()
			this.offset++
			this.render()
			setTimeout(function() { that.prepare() }, 0)
		} else {
		    	this.prepare()
			this.repeat()
		}
	},
	prepare : function() {
		var that = this
        	var samples = this.wav.randomBeats(1)
        	var audio = this.wav.binaryAudio(samples)
        	audio.addEventListener('ended', function(e) {
        		that.repeat()
        		setTimeout(function() {
        			e.target.parentNode.removeChild(e.target)
        		}, 0)
        	}, false)
        	this.next = audio
	},
	pause : function() {
		this.paused = true
		this.current.pause()
	},
	render : function() {
		this.onupdate()
		this.output.css({fontSize: "10px", display:"inline"})
		this.output.html(
			this.page[this.offset]
				.replace(/^[\r\n]+/g,"")
				.replace(/[\r\n]+$/g,"")
				.replace(/(\r\n|[\r\n])/g,"<br>")
		)
		var body_w = document.body.clientWidth
		var body_h = document.body.clientHeight
		var output_w = this.output.attr("offsetWidth")
		var new_fs = Math.ceil((body_w/output_w) * 9)
		if(new_fs > 10000) { return }
		this.output.css({fontSize:new_fs+"px", display:"table-cell", height:body_h, width:body_w})
		var output_h = this.output.attr("offsetHeight")
		if(output_h > body_h) {
			var new_fs = Math.ceil((body_h/output_h) * new_fs * 0.85)
			this.output.css({fontSize:new_fs + "px"})
		}
	},
	seek : function(offset) {
		this.offset = offset
	}
}

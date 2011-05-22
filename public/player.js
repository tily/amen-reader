
var Player = function(output) {
	this.output = output
	this.page = []
	this.json = null
	this.offset = 0
	this.paused = true
	this.onload = function() {}
	this.onupdate = function() {}
	this.onended = function() {}
	this.textLoaded = false
	this.wavLoaded = false
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
				if(that.textLoaded && that.wavLoaded && that.paused) { that.onload(that.json) ; that.play() }
			}
		})
		this.wav = new WavFile(source.audio, function(wav) {
			wav.beatDetect()
			that.wavLoaded = true
			if(that.textLoaded && that.wavLoaded && that.paused) { that.onload(that.json) ; that.play() }
		})
	},
	play : function() {
		if(this.paused) return
		var that = this
		if(this.next) {
		    	window.audio = this.next.audio
			this.next.audio.play()
			this.render()
			setTimeout(function() { that.prepare() }, 0)
		} else {
		    	this.prepare()
			this.play()
		}
		this.offset++
	},
	prepare : function() {
		var that = this
        	var samples = this.wav.randomBeats(4)
        	var audio = this.wav.binaryAudio(samples)

        	var sampleVars = []
        	for(var i = 0; i < samples.length; i++) {
        		sampleVars.push(samples.charCodeAt(i) & 0xff)
        	}

        	audio.addEventListener('ended', function(e) {
        		that.play()
        		setTimeout(function() {
        			e.target.parentNode.removeChild(e.target)
        		}, 0)
        	}, false)

        	this.next = { audio: audio, vars: sampleVars }
	},
	pause : function() {
		this.paused = true
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
		var body_w = document.body.offsetWidth
		var body_h = document.body.offsetHeight
		var output_w = this.output.attr("offsetWidth")
		var new_fs = Math.ceil((body_w/output_w) * 9)
		if(new_fs > 10000) { return }
		this.output.css({fontSize:new_fs+"px", display:"block"})
		var output_h = this.output.attr("offsetHeight")
		if(output_h > body_h) {
			var new_fs = Math.ceil((body_h/output_h) * new_fs * 0.85)
			this.output.css("fontSize", new_fs + "px")
		}
	},
	seek : function(offset) {
		this.offset = offset
	}
}

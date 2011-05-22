require 'kconv'
require 'open-uri'
require 'rubygems'
require 'json'
require 'sinatra'

REGEXP = %r|^http://www\.aozora\.gr\.jp/cards/\d+/files/[\d_]+\.html$|

get '/json/*' do
	url = params[:splat].join('')
	return 'not aozora url' unless url[REGEXP]
	src = open(url).read.toutf8
	title = src[%r|<h1 class="title">(.+)</h1>|, 1]
	author = src[%r|<h2 class="author">(.+)</h2>|, 1]
	text = src[%r|<div class="main_text">(.+)<div class="bibliographical_information">|m, 1]
	text.gsub!(%r{<ruby><rb>(.+?)</rb>(.+?)</ruby>}) {$1}
	text.gsub!(%r{<.+?>}m, '')
	text.gsub!(%r{^(\r\n|[\r\n])}, '')
	text.chomp!
	{'title' => title, 'text' => text, 'author' => author}.to_json
end

get '/*' do
	@url = params[:splat].join('')
	return 'not aozora url' unless @url[REGEXP]
	erb :app
end


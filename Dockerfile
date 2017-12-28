FROM ruby
WORKDIR /usr/local/app
ADD . /usr/local/app
RUN bundle install

# Scrapy(Stocks Scraper)

This crawler uses puppeteer to tradingview.com, and collects information on stocks in various sectors including healthcare, technology, energy, and more. It collects information such as the rating, name, price, change in price, etc. of stocks and stores them locally in a xlsx file on an automated schedule (just after the markets close for the day).

## Motivation

The reason I created this repository was primarily to gain experience in automated web scraping to retrieve and store data from the web into a xlsx file. A secondary goal was to learn a bit about investing and the stock market along the way in order to plan for my financial future.

## Future Steps

I may in the future attempt to analyze news articles for sentiment analysis, and see if I can use that to observe some kind of trends in stock prices. In addition, I also want to create a data pipeline to analyze my crawler's logs to ensure the automation is continually running smoothly. For now, this has simply been a good introduction into web scraping, and I am currently looking for a project I am more interested in to apply these concepts.

## What I've Learned

1. How to call API and css selectors to extract information from specific web pages.
2. How to automate running programs using <mark> NodeJS </mark>
3. <mark> File System and Path </mark> - how to create directories and use them according to our needs
4. Web scraping basics, such as:

- Limiting page requests to prevent bot detection or removal (and to be nice to the target website)
- Webpages contain robots.txt files that provide valuable information on their web-crawling policies
- Difficulties around crawling dynamically loaded content
- Websites create pitfalls to detect bots such as hidden tags that would only be visible to bots
- How to schedule program through <mark> NODE-CRON </mark> so that it automates our task
  

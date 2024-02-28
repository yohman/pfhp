# FaViz: Visualizing villages, families, and egos in the Edo Period

<style>

.post-image {
    width: 80%;
    height: auto;
    margin: 10px;
    padding: 10px;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
}

.big-quote {
    font-size: 1.2rem;
    font-weight: bold;
    font-family:'Courier New', Courier, monospace';
    color: rgb(213, 213, 213) !important;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin: 0 0 -2rem !important;
}

caption {
    font-size: 0.8rem;
    color: #888;
    text-align: center;
    margin-top: -10px;
    margin-bottom: 20px;
    
}

.caption {
    font-size: 0.8rem;
    color: #888;
    text-align: center;
    margin-top: -10px;
    margin-bottom: 20px;
    
}
</style>



[![website snapshot](image-11.png)]([image-11.png](https://yohman.github.io/pfhp/households.html))


→ [https://yohman.github.io/pfhp/households.html](https://yohman.github.io/pfhp/households.html)

What did a household look like for common people in early modern Japan? Were there multiple generations living under one roof? Who would assume the role of household head, how often did people from outside their village come to live with them, and how many servants did each household have?

These questions, and many more, are revealed through **FaViz**, a visualization of a rare digital collection of *Shumon-aratame-cho (SAC)* and *Ninbetsu-aratame-cho (NAC)*, which are the two major sources for the research of historical demography in Japan. FaViz is an interactive visualization tool for longitudinal and comparative inspection, applied to the records of thousands of lives of people. Its intuitive interface will allow us to gain new understanding of our history and the resilience of people to socioeconomic and environmental changes.

## It's not what it looks like: The origins of the data named "Shumon-aratame-cho"

<img src="image-12.png" class="post-image">

<span class="caption">↑ An example of the original document shows a page from Niremata Village, Mino Province, 1638 (Cornell & Hayami, 1986)</span>

The first modern national census in Japan was conducted in 1920. Despite its rich history, there has been no systematic or sustained population data intake prior to 1920. In spite of this, there was a comprehensive population registry conducted and established by the Tokugawa government during the 17th century. It was an unusual set of circumstances that led to the creation of this registry, which was by no account originally meant to be used as a census. Its origins were rather inauspicious and haunting, with a singular purpose: to abolish Christianity from Japan, which at the time, was deemed to pose a threat to the rulers intent on national unification. 

<span class="big-quote">
「宗門」(shumon)　→　religious investigation<br>
「改帳」(aratamecho)　→　registry
</span>

While the original intent of these documents was to abolish Christianity, it is uncertain as to whether or not it served to fulfill its purpose. Moreover, with little effort to centralize and/or standardize the collection process, the documents were deemed to have little value. The decentralized nature of the documents inevitably led to many documents being thrown away or lost entirely over the years (Cornell & Hayami, 1986). What did survive—and a good portion managed to do so—have become a treasure-trove for historical demographers, allowing for an unprecedented view into population statistics in early modern Japan.

## Original Paper → Microfilm → Digital → Visualization (kind of)

The process of converting analog information into digital data is never easy, often necessitating a painstaking phase of arduous manual data input. While modern technologies like OCR make automation possible, the nature of historical documents in their calligraphic state make this particular collection impossible for machine learning and automation. Fortunately, this archive was handled and digitized by a group of dedicated historians, led by Akira Hayami, founder of historical Japanese demography whose group collected, transcribed, and coded this registry into digital form. 

![alt text](<images/original shumon 112.jpg>)

<span class = "caption">The original document for household #112 in Niita, year 1763 (Kurosu, et al., 2021)</span>


While the title to this section suggests that the original documents were converted to microfilm and then made digital, the actual process included several additional steps in between, one of which was a paper form called the Basic Data Sheet (BDS). The BDS was essentially an equivalent form of the original calligraphy entry, but in a tabular—but still manually entered—format shown below. 

![alt text](<images/bds 112.jpg>)
<span class="caption">A copy of the BDS for Household #112 (Kurosu et al., 2021)</span>


The digitization would demand yet another manual process: coding. Coders extracted information from each BDS and organized them by handwriting data into paper forms, creating elaborate codebooks that marked every possible permutation between various categories of household codes and individual relationships. Because of this formidably laborious process, only a handful of villages made it into "Xavier," the name given to the relational database that lives today as the home for this digital archive. Xavier is an impressive big data endeavor. It boasts data for 346,700 egos, and with numerous relational columns, amasses to having more than 21 million total data points.

This visualization project builds upon the cumulative labor instituted by previous historians. It is the icing on the cake per se, but an important one for several reasons. First, while this archive presents itself as a rare digital collection for the study of Japanese demographic history, it remains in the domain of experts. Only the most dedicated of demographic scholars can make sense of the intricacies within the complex dataset, having to use sophisticated methods to pursue their own research agendas. For this reason, it fails to justify the enormous groundwork and labor expended in the creation of Xavier, as its usefulness is kept within the confines of experts. 

To this account, the second reason is to elevate the lived experiences and narratives of early modern Japanese households in a form that is instantly accessible, visually intuitive, and *understandable*, bringing relevancy to the roots of household and family structures.

A final reason that makes this visualization meaningful is its longitudinal representation. Neither the NAC nor the BDS makes viewing an entire household history easy—doing so would require the extraction of numerous BDS pages. This makes it difficult to situate and compare households from one another. 
![alt text](<images/nac bds web.jpg>)

<span class="caption">Original aratamecho document (left), BDS (middle), interactive website (right), all showing data for Household #112

## "Big data" for two villages, from 1716 to 1869
<img src="image-14.png" width=400>

Of the surviving documents, two villages stand out as having the most complete set of annual coverage. Located in Fukushima Prefecture, Niita Village and Shimomoriya village's combined registry data consists of 118,879 total records. 

### Missing data
As "complete" as the data may be, it is not without gaps. The following table illustrates where data is lacking for each village.

| Village    | Years Range | Missing Years                               |
|------------|-------------|---------------------------------------------|
| Shimomoriya| 1716-1869   | 1720, 1729, 1846, 1850, 1858, 1864-1867    |
| Niita      | 1720-1870   | 1742, 1758, 1796, 1857, 1858                |


### Descriptive statistics

| Village | Total Records | Total Households | Total Individuals | Average Household Size | Largest Household |
|---------|---------------|------------------|-------------------|------------------------|--|
| Niita   |        68,682       |340|3,875|4.24|[33](https://yohman.github.io/pfhp/households.html?vil_id=5010130&hhid=6330000)|
| Shimomoriya |      50,197     |207|2,382|4.46|[23](https://yohman.github.io/pfhp/households.html?vil_id=5040310&hhid=4600000)|


## Mini-timelines

In order to untangle the complexities of the relational database, we use modalities that the general public can relate to. By distilling big data in generically meaningful segments such as "villages," "households," and "family roles," the historical registry comes to life, revealing interactive family lineages as never seen before. 

A macro view of the family histories can be visualized through a series of "mini" timelines. A village will consist of numerous timelines, with each representing a household's entire recorded history. This more than likely results in timelines that span multiple generations, but what makes these graphics compelling is that you can determine the relative size, wealth, and longevity of each household. Here is an example of eight households in the Shimomoriya village. Notice the differences in sizes and shapes, visual temporal snapshots that demonstrate diverse familial circumstances within a single village. Some families have lineages that span the entire timeframe (households #460 and 481), while others occupy a shortened segment (households #450,#461,#470,#471,#480). [Household #460](https://yohman.github.io/pfhp/households.html?vil_id=5040310&hhid=4600000) stands out for its prodigious presence, especially in the early phase of its recorded history. In fact, in years 1749 and 1750, it housed a total of 23 members, by far the largest household size recorded in Shimomoriya village.

<img src="image-13.png" class="post-image">

<caption>A series of eight mini-timelines in Shimomoriya village</caption>


Now let's look at [household #112](https://yohman.github.io/pfhp/households.html?vil_id=5010130&hhid=11200000) in Niita village, which was previously shown in its original format, and shown here in its mini-timeline form:

![alt text](<images/mini-timeline 112.jpg>)

This households' timeline spans the full extent of the recorded data for Niita village, starting in 1720 and ending in 1870, a 150 year history. It shows a stable, resilient, common household, one that survived the trials of generations, with only core family members living together (with a few exceptions in the latter years).

Take another example [household #1 from Shimomoriya Village](https://yohman.github.io/pfhp/households.html?vil_id=5040310&hhid=100000). In this timeline, recorded history begins in 1716 and ends in 1863, a span of 147 years.

![alt text](image-7.png)

Gender is presented in blue and red squares, households heads with a star, and spouses of household heads with a black dot. Servants (gray squares), are present throughout, indicative of the prolonged wealth of the family. The non-stem kins (in yellow) indicate the occasional presence of uncles/aunts, nephews/nieces, and cousins in the household.

Consider the following mini-timeline ([household # 219 in Niita Village)](https://yohman.github.io/pfhp/households.html?vil_id=5010130&hhid=21900000):

![alt text](image-16.png)

Here, one witnesses a relatively short family history, from 1793 to 1851. The male household head (indicated by the blue box with a star), marries and has a child (1799) who dies after just six years. Three years after the death of their daughter (1808)—perhaps to help deal with tragedy—the household is joined by a "non stem kin," likely a sibling of either the husband or wife. The father, however, dies three years later in 1810, as illustrated below:

![alt text](image-17.png)

What happens next is entirely up to speculation, but one may presume that the household is joined by relatives (including a 13 year old niece). At the same time, the wife of the deceased husband is absent for two years, taking a leave to deal with the death of her husband, only to come back in 1813 assuming the role as the new household head. But she does not return alone, instead, she now has a new husband with her, and together, they live until their respective deaths many years later, without having any children.

This, and many more narratives are available to witness via this interactive web platform. In doing so, we discover patterns previously not seen through tabular or other forms of data analysis, as the visual narratives convey the human story in an immersive manner.



## Acknowledgements

This project is being developed at the [Population and Family History Center](https://www.pfhp-japan.info/) at [Reitaku University](https://www.reitaku-u.ac.jp/), Japan.

## Bibliography

Cornell, L. L., & Hayami, A. (1986). The Shumon Aratame Cho: Japan’s Population Registers. Journal of Family History, 11(4), 311-328. https://doi.org/10.1177/036319908601100401

Kurosu, S., Takahashi, M., & Dong, H. (2021). Thank You, Akira Hayami! The Xavier Database of
Historical Japan. Historical Life Course Studies, 11, 112–131. https://doi.org/10.51964/hlcs11113


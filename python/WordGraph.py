# from textblob import Wrod
import networkx as nx
# note need to run nltk.download() once & install wordnet in "All Packages"
# 155,287 words organized in 117,659 synsets for a total of 206,941 word-sense pairs
from nltk.corpus import wordnet as wn

class WordGraph(object):
    """
    graph object of synset hyponym trees
    using Princeton's Wordnet
    """
    def __init__(self):
        """
        default constructor that initializes
        graph from all of the synsets
        """
        # use networkX to create a directed graph
        # of words
        self.__graph = nx.DiGraph()
        # # map graph nodes to positions
        # self.__layout = {}
        # # map words to the synsets they belong to
        # self.__words_to_synsets = {}
        # # reverse of above
        # self.__synsets_to_words = {}
        # # map words to tense, definition, and id
        # self.__info_dict = {}
        # create w/ all synsets
        self.__create_graph_all_words()

    def __create_graph_all_words(self):
        """
        creates the connections using
        wn.all_synsets and Synset.hyponyms
        """
        # for each of the parts of speach
        # connections are supported only for nouns & verbs
        for synset in wn.all_synsets():
            parent = synset
            children = parent.hyponyms()
            # self.__recurse_down_tree(parent, children)
            self.__add_to_graph(parent, children)

    def __add_to_graph(self, parent, children):
        """
        add the parent node to the graph
        and an edge to all the parents children(hyponyms)
        """
        self.__graph.add_node(WordGraph.__label(parent),
            definition=str(parent.definition()))
        for child in children:
            self.__graph.add_edge(str(parent.name()), str(child.name()))

    @staticmethod
    def __label(synset):
        """
        create a label from the
        funny synset name
        """
        split = str(synset.name()).split('.')
        pos = split[-2]
        name = '.'.join(split[0:-2])
        return "{} ({})".format(name, pos)



    # this function does not work well w/ recursion, use __add_to_graph
    # use if using Synset.tree rather than Synset.hyponyms
    # def __recurse_down_tree(self, parent, children):
    #
    #     self.__graph.add_node(str(parent.name()))
    #
    #     # base case: if there are no children
    #     if len(children) == 0:
    #         return
    #     # shift down a level on the tree
    #     grandparent = parent
    #     for child in children:
    #         parent = child[0]
    #         # if this tree was already added to the graph
    #         if str(parent.name()) in self.__graph.nodes():
    #             continue
    #         self.__graph.add_edge(str(grandparent.name()), str(parent.name()))
    #         children = child[1:]
    #         self.__recurse_down_tree(parent, children)

    def get_graph(self):
        """
        return the graph for use in nx
        """
        return self.__graph

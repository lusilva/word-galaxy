from textblob import Word
import networkx as nx
import relations
import logging
import math
import string


class Dictionary(object):
    synsets = set()
    graph = nx.DiGraph()
    layout = dict()

    def __init__(self, words):
        self.__construct(words)

    def __construct(self, words):
        for raw_word in words:
            word = Word(raw_word)
            # If this word has no synsets, then go to next word
            if len(word.synsets) == 0:
                continue
            # Add the word to the graph.
            self.graph.add_node(raw_word, type='word', label=raw_word)
            # Add all synsets of the word to the graph, and connect it to the word.
            self.__add_synsets(word, raw_word)

        # Connect all hypernyms
        # ex: plant ---> organism, tree ---> plant
        self.__connect_hypernyms()

        # Connect all member holonyms
        # ex: plant ---> plantae
        self.__connect_member_holonyms()

        # Connect all part meronyms
        # ex: trunk ---> tree
        self.__connect_part_meronyms()

    def get_graph(self):
        return self.graph

    def calculate_spring_layout(self, scale):
        layout = nx.spring_layout(self.graph, scale=scale, weight='weight')
        for node in layout:
            coords = layout[node]
            self.graph.node[node]['x'] = "{0:.2f}".format(round(coords[0], 2))
            self.graph.node[node]['y'] = "{0:.2f}".format(round(coords[1], 2))

    @staticmethod
    def __calculate_word_weight(from_word, to_synset):
        from_synsets = from_word.synsets
        from_synsets_length = len(from_synsets)
        weight_sum = 0
        for synset in from_synsets:
            distance = synset.wup_similarity(to_synset)
            if distance is None:
                distance = 1
            weight_sum += math.ceil(distance * 1000)
        return math.ceil(weight_sum / from_synsets_length)

    def __add_synsets(self, word, raw_word):
        synsets = word.synsets
        for synset in synsets:
            if synset not in self.synsets:
                self.synsets.add(synset)
                name, tense = self.__parse_synset_name_and_tense(synset.name())
                self.graph.add_node(synset.name(),
                                    type='synset',
                                    label=name,
                                    tense=tense,
                                    definition=synset.definition(),
                                    lemmas=','.join(synset.lemma_names()))
            logging.debug(raw_word + ' ---> ' + synset.name())
            self.graph.add_edge(raw_word,
                                synset.name(),
                                relation='belongs_to_synset',
                                weight=self.__calculate_word_weight(word, synset))
        return synsets

    @staticmethod
    def __parse_synset_name_and_tense(synset_name):
        name_arr = string.split(synset_name, '.')
        name = name_arr[0]
        tense = name_arr[1]
        name = name.replace('_', ' ')
        return name, tense

    def __connect_hypernyms(self):
        self.__connect_relation(relations.HYPERNYM)

    def __connect_member_holonyms(self):
        self.__connect_relation(relations.MEMBER_HOLONYM)

    def __connect_part_meronyms(self):
        self.__connect_relation(relations.PART_MERONYM, True)

    def __connect_relation(self, relation, inverse=False):
        for synset in self.synsets:
            related_synsets = self.synsets.intersection(self.__get_related_synsets(synset, relation))
            for related_synset in related_synsets:
                from_node = synset
                to_node = related_synset
                if inverse:
                    from_node = related_synset
                    to_node = synset
                logging.debug(from_node.name() + ' ---' + relation + '--> ' + to_node.name())
                self.graph.add_edge(from_node.name(),
                                    to_node.name(),
                                    relation=relation,
                                    weight=math.ceil(from_node.wup_similarity(to_node) * 1000))

    @staticmethod
    def __get_related_synsets(synset, relation):
        if relation == relations.HYPERNYM:
            return set(synset.hypernyms())
        elif relation == relations.MEMBER_HOLONYM:
            return set(synset.member_holonyms())
        elif relation == relations.PART_MERONYM:
            return set(synset.part_meronyms())
        else:
            return set()

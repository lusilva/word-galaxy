from textblob import Word
from nltk.corpus import wordnet as wn
import networkx as nx
import relations
import logging
import math
import string


class Dictionary(object):
    graph = nx.DiGraph()
    layout = dict()
    words_to_synsets = dict()
    synsets_to_words = dict()
    info_dict = dict()

    def __init__(self, words=None):
        if words is None:
            self.__construct_all_synsets()
        else:
            self.__construct_from_words(words)

    def __construct_all_synsets(self):
        for pos in ['a', 's', 'r', 'n', 'v']:
            for synset in list(wn.all_synsets(pos)):
                name, tense = self.__parse_synset_name_and_tense(str(synset.name()))
                info = dict()
                info['tense'] = str(tense)
                info['definition'] = str(synset.definition())
                info['id'] = str(synset.name())
                key = name + ' (' + tense + ')'

                if key in self.words_to_synsets:
                    self.info_dict[key].append(info)
                    self.words_to_synsets[key].add(synset)
                else:
                    self.info_dict[key] = [info]
                    self.words_to_synsets[key] = {synset}

                self.synsets_to_words[synset] = {key}

        for key in self.words_to_synsets:
            self.graph.add_node(key, data=self.info_dict[key])

        self.__connect_hypernyms()

        # self.__connect_member_holonyms()
        #
        # self.__connect_part_meronyms()

        print len(self.graph.nodes())
        print len(self.graph.edges())

    def __construct_from_words(self, words):
        for raw_word in words:
            word = Word(raw_word)
            # If this word has no synsets, then go to next word
            if len(word.synsets) == 0:
                continue
            # Add the word to the graph.
            self.__add_word_node(raw_word, word)
            # self.graph.add_node(raw_word, type='word', label=raw_word)
            # Add all synsets of the word to the graph, and connect it to the word.
            # self.__add_synsets(word, raw_word)

        self.__connect_same_synsets()

        # Connect all hypernyms
        # ex: plant ---> organism, tree ---> plant
        self.__connect_hypernyms()

        # Connect all member holonyms
        # ex: plant ---> plantae
        self.__connect_member_holonyms()

        # Connect all part meronyms
        # ex: trunk ---> tree
        self.__connect_part_meronyms()

    def __connect_same_synsets(self):
        for synset in self.synsets_to_words:
            connected_words = self.synsets_to_words[synset]
            for from_word in connected_words:
                for to_word in connected_words:
                    if from_word == to_word or ((from_word in self.graph) and (to_word in self.graph[from_word])):
                        continue
                    weight = self.__determine_weight(from_word, to_word)
                    if weight > 0:
                        self.graph.add_edge(from_word, to_word, relation='lemma', weight=weight)

    def __determine_weight(self, from_word, to_word):
        from_synsets = self.words_to_synsets[from_word]
        to_synsets = self.words_to_synsets[to_word]
        weight = list(from_synsets)[0].path_similarity(list(to_synsets)[0], simulate_root=False)
        # for from_synset_index in range(0, len(from_synsets)):
        #     for to_synset_index in range(0, len(to_synsets)):
        #         from_synset = from_synsets[from_synset_index]
        #         to_synset = to_synsets[to_synset_index]
        #         # print from_synset.name() + '----->' + to_synset.name()
        #         if from_synset == to_synset:
        #             weight += 1
        #         else:
        #             weight += (from_synset.path_similarity(to_synset) or 0)
        return weight or 0

    def __add_word_node(self, raw_word, word):
        self.words_to_synsets[raw_word] = set()
        definitions = []
        for synset in word.synsets:
            name, tense = self.__parse_synset_name_and_tense(synset.name())
            definition = dict()
            definition['synset'] = str(synset.name())
            definition['name'] = str(name)
            definition['tense'] = str(tense)
            definition['definition'] = str(synset.definition())
            definition['synonyms'] = ', '.join(map(str, synset.lemma_names())).replace('_', ' ')
            definitions.append(definition)

            if synset in self.synsets_to_words:
                self.synsets_to_words[synset].add(raw_word)
            else:
                self.synsets_to_words[synset] = {raw_word}

            self.words_to_synsets[raw_word].add(synset)

        self.graph.add_node(raw_word, label=raw_word, definitions=str(definitions))

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
        for word in self.words_to_synsets:
            for synset in self.words_to_synsets[word]:
                related_synsets = self.__get_related_synsets(synset, relation)
                for related_synset in related_synsets:
                    if related_synset not in self.synsets_to_words:
                        continue
                    for related_word in self.synsets_to_words[related_synset]:
                        if related_word == word:
                            continue
                        from_node = word
                        to_node = related_word
                        if inverse:
                            from_node = related_word
                            to_node = word
                        weight = self.__determine_weight(from_node, to_node)
                        if weight < 0.1:
                            continue
                        if from_node == to_node or ((from_node in self.graph) and (to_node in self.graph[from_node])):
                            continue
                        logging.debug(from_node + ' ---' + relation + '--> ' + to_node + ' (' + str(weight) + ')')
                        self.graph.add_edge(from_node,
                                            to_node,
                                            relation=relation,
                                            weight=weight)

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

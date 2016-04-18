from classes.dictionary import Dictionary
import logging, sys
from networkx.readwrite import json_graph
import json
import networkx as nx


def main():
    logging.basicConfig(stream=sys.stderr, level=logging.ERROR)

    # Set to either google-10000 or small-data
    data_file = 'google-1000'

    # create a set of words from the input file
    word_set = set()
    with open(data_file + '.txt') as f:
        for word in f:
            word_set.add(word.rstrip())

    # create a new dictionary with the words
    dictionary = Dictionary()
    graph = dictionary.get_graph()
    # dictionary.calculate_spring_layout(100)
    # plt.savefig("path.png")
    with open('generated-' + data_file + '.json', 'w') as outfile:
        outfile.write(json.dumps(json_graph.node_link_data(graph)))


if __name__ == '__main__':
    main()

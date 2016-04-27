import sys
import logging
from WordGraph import WordGraph
import networkx as nx
from networkx.readwrite import json_graph
import json


if __name__ == '__main__':
    word_graph = WordGraph()
    graph = word_graph.get_graph()
    # write each line of the dictionary to the json file
    with open('output/generated.json', 'w') as outfile:
        outfile.write(json.dumps(json_graph.node_link_data(graph)))
    nx.write_gexf(graph, 'output/generated.gexf')
